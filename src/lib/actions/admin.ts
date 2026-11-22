"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteUpload } from "@/lib/storage";
import { CONTENT_SCHEMA } from "@/lib/content-schema";
import { youtubeId } from "@/lib/video";
import { slugify } from "@/lib/utils";
import { FACEBOOK_MAX_PHOTOS, facebookConfig, facebookPageInfo, publishPhotoPost, publishToFacebook, uploadUnpublishedPhoto } from "@/lib/facebook";

export type Result = { ok: true; message?: string; warning?: string; id?: string } | { ok: false; error: string };

const refresh = () => revalidatePath("/", "layout");
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof z.ZodError ? e.issues[0].message : (e as Error).message || "Something went wrong." });

/* ───────────── Homepage video ───────────── */

const videoSchema = z.object({
  enabled: z.boolean(),
  sourceType: z.enum(["upload", "youtube", "url"]),
  url: z.string().trim(),
  poster: z.string().trim(),
  title: z.string().trim().max(120),
  caption: z.string().trim().max(400),
  autoplay: z.boolean(),
  muted: z.boolean(),
  loop: z.boolean(),
});

export async function saveVideo(input: Omit<z.input<typeof videoSchema>, "sourceType"> & { sourceType: string }): Promise<Result> {
  await requireAdmin();
  try {
    const data = videoSchema.parse(input);
    if (data.enabled && !data.url) throw new Error("Add a video before turning it on.");
    if (data.sourceType === "youtube" && data.url && !youtubeId(data.url)) throw new Error("That doesn't look like a YouTube link.");
    if (data.sourceType === "url" && data.url && !/^https?:\/\//.test(data.url)) throw new Error("Video links must start with https://");
    const prev = await prisma.videoSetting.findUnique({ where: { id: "homepage" } });
    await prisma.videoSetting.upsert({ where: { id: "homepage" }, update: data, create: { id: "homepage", ...data } });
    // Clean up replaced uploads
    if (prev && prev.url !== data.url) await deleteUpload(prev.url);
    if (prev && prev.poster !== data.poster) await deleteUpload(prev.poster);
    refresh();
    return { ok: true, message: data.enabled ? "Video saved and live on the home page." : "Video saved (currently hidden)." };
  } catch (e) { return fail(e); }
}

/* ───────────── Site content (PageContent) ───────────── */

export async function saveContent(page: string, values: Record<string, string>): Promise<Result> {
  await requireAdmin();
  try {
    const def = CONTENT_SCHEMA.find((p) => p.page === page);
    if (!def) throw new Error("Unknown section.");
    const existing = await prisma.pageContent.findMany({ where: { page } });
    const old = Object.fromEntries(existing.map((r) => [r.section, r.value]));
    await prisma.$transaction(
      def.fields
        .filter((f) => f.section in values)
        .map((f, i) =>
          prisma.pageContent.upsert({
            where: { page_section: { page, section: f.section } },
            update: { value: values[f.section] ?? "" },
            create: { page, section: f.section, type: f.type, label: f.label, value: values[f.section] ?? "", sortOrder: i },
          })
        )
    );
    for (const f of def.fields) {
      if ((f.type === "image" || f.type === "file") && f.section in values && old[f.section] && old[f.section] !== values[f.section]) {
        await deleteUpload(old[f.section]);
      }
    }
    refresh();
    return { ok: true, message: `${def.title} saved.` };
  } catch (e) { return fail(e); }
}

/* ───────────── News / blog posts ───────────── */

const postSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(200),
  category: z.string().trim().min(1).max(40).default("News"),
  excerpt: z.string().trim().max(400).default(""),
  content: z.string().trim().min(10, "Write a little more in the story"),
  image: z.string().trim().default(""),
  photos: z
    .array(z.string().trim().regex(/^(\/uploads\/|https?:\/\/)/, "Invalid photo"))
    .max(FACEBOOK_MAX_PHOTOS, `A post can have at most ${FACEBOOK_MAX_PHOTOS} photos`)
    .default([]),
  author: z.string().trim().max(80).default("Naledi School"),
  published: z.boolean().default(true),
});

async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "post";
  let slug = base;
  for (let n = 2; ; n++) {
    const hit = await prisma.blogPost.findUnique({ where: { slug } });
    if (!hit || hit.id === ignoreId) return slug;
    slug = `${base}-${n}`;
  }
}

export async function savePost(id: string | null, input: z.input<typeof postSchema>): Promise<Result> {
  await requireAdmin();
  try {
    const data = postSchema.parse(input);
    data.photos = [...new Set(data.photos)].filter((p) => p !== data.image);
    if (!data.excerpt) data.excerpt = data.content.replace(/\s+/g, " ").slice(0, 180) + (data.content.length > 180 ? "…" : "");
    let savedId: string;
    if (id) {
      const prev = await prisma.blogPost.findUniqueOrThrow({ where: { id } });
      await prisma.blogPost.update({ where: { id }, data: { ...data, slug: prev.title === data.title ? prev.slug : await uniqueSlug(data.title, id) } });
      // Remove files that are no longer used by this post
      const keep = new Set([data.image, ...data.photos]);
      for (const f of [prev.image, ...prev.photos]) if (f && !keep.has(f)) await deleteUpload(f);
      savedId = id;
    } else {
      savedId = (await prisma.blogPost.create({ data: { ...data, slug: await uniqueSlug(data.title) } })).id;
    }
    refresh();
    return { ok: true, id: savedId, message: id ? "Post updated." : "Post published on the website." };
  } catch (e) { return fail(e); }
}

/* ───────────── Facebook ───────────── */

async function shareablePost(id: string) {
  if (!facebookConfig()) throw new Error("Facebook isn't set up yet — see docs/facebook-setup.md.");
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found.");
  if (!post.published) throw new Error("Make the post visible on the website before sharing it.");
  return post;
}

const postImages = (p: { image: string; photos: string[] }) =>
  [...new Set([p.image, ...p.photos].filter(Boolean))].slice(0, FACEBOOK_MAX_PHOTOS);

async function recordFacebookError(id: string, error: string) {
  await prisma.blogPost.update({ where: { id }, data: { facebookError: error.slice(0, 500) } }).catch(() => {});
  revalidatePath("/admin/news");
}

/** Text-only share, or a single photo — one request. */
export async function shareToFacebook(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const post = await shareablePost(id);
    const fbId = await publishToFacebook(post);
    await prisma.blogPost.update({ where: { id }, data: { facebookPostId: fbId, facebookPostIds: [fbId], facebookPostedAt: new Date(), facebookError: "" } });
    revalidatePath("/admin/news");
    return { ok: true, message: "Shared on Facebook." };
  } catch (e) {
    const error = (e as Error).message;
    await recordFacebookError(id, error);
    return { ok: false, error };
  }
}

/* Multi-photo share runs in three steps driven by the admin page, so it can show progress:
 *   1. prepareFacebookShare  → list of photos to send
 *   2. uploadFacebookPhoto   → called once per photo
 *   3. finishFacebookShare   → creates the post(s) */

export async function prepareFacebookShare(id: string): Promise<{ ok: true; images: string[] } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const post = await shareablePost(id);
    return { ok: true, images: postImages(post) };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}

export async function uploadFacebookPhoto(id: string, image: string): Promise<{ ok: true; photoId: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const post = await shareablePost(id);
    if (!postImages(post).includes(image)) throw new Error("That photo doesn't belong to this post.");
    return { ok: true, photoId: await uploadUnpublishedPhoto(image) };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}

export async function finishFacebookShare(id: string, photoIds: string[]): Promise<Result> {
  await requireAdmin();
  try {
    const post = await shareablePost(id);
    const ids = z.array(z.string().min(1)).min(1).max(FACEBOOK_MAX_PHOTOS).parse(photoIds);
    const res = await publishPhotoPost(post, ids);
    await prisma.blogPost.update({
      where: { id },
      data: { facebookPostId: res.ids[0], facebookPostIds: res.ids, facebookPostedAt: new Date(), facebookError: res.error ? `Only ${res.posted} of ${ids.length} photos were posted: ${res.error}`.slice(0, 500) : "" },
    });
    revalidatePath("/admin/news");
    const split = res.ids.length > 1 ? ` Facebook didn't accept ${ids.length} photos in one post, so they were shared as ${res.ids.length} posts.` : "";
    if (res.error) return { ok: true, message: `Shared ${res.posted} of ${ids.length} photos on Facebook.`, warning: `The rest failed: ${res.error}` };
    return { ok: true, message: `Shared on Facebook with ${ids.length} photo${ids.length > 1 ? "s" : ""}.${split}` };
  } catch (e) {
    const error = (e as Error).message;
    await recordFacebookError(id, error);
    return { ok: false, error };
  }
}

export async function testFacebookConnection(): Promise<Result> {
  await requireAdmin();
  if (!facebookConfig()) return { ok: false, error: "Facebook isn't set up yet — add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to .env and restart." };
  try {
    const page = await facebookPageInfo();
    return { ok: true, message: `Connected to the Facebook Page “${page.name}”.` };
  } catch (e) { return fail(e); }
}

export async function deletePost(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const p = await prisma.blogPost.delete({ where: { id } });
    for (const f of [p.image, ...p.photos]) await deleteUpload(f);
    refresh();
    return { ok: true, message: "Post deleted." };
  } catch (e) { return fail(e); }
}

export async function togglePost(id: string, published: boolean): Promise<Result> {
  await requireAdmin();
  await prisma.blogPost.update({ where: { id }, data: { published } });
  refresh();
  return { ok: true, message: published ? "Post is now public." : "Post hidden from the website." };
}

/* ───────────── Gallery ───────────── */

const gallerySchema = z.object({
  title: z.string().trim().min(1, "Give the photo a title").max(150),
  description: z.string().trim().max(500).default(""),
  image: z.string().trim().min(1, "Upload a photo"),
  category: z.string().trim().min(1).max(40).default("General"),
  sortOrder: z.coerce.number().int().default(0),
});

export async function addGalleryImages(items: { image: string; title: string }[], category: string): Promise<Result> {
  await requireAdmin();
  try {
    if (!items.length) throw new Error("No photos uploaded.");
    await prisma.galleryImage.createMany({
      data: items.map((i) => ({ image: i.image, title: i.title.slice(0, 150) || "Photo", category: category.trim() || "General" })),
    });
    refresh();
    return { ok: true, message: `${items.length} photo${items.length > 1 ? "s" : ""} added to the gallery.` };
  } catch (e) { return fail(e); }
}

export async function saveGalleryImage(id: string, input: z.input<typeof gallerySchema>): Promise<Result> {
  await requireAdmin();
  try {
    const data = gallerySchema.parse(input);
    const prev = await prisma.galleryImage.findUniqueOrThrow({ where: { id } });
    await prisma.galleryImage.update({ where: { id }, data });
    if (prev.image !== data.image) await deleteUpload(prev.image);
    refresh();
    return { ok: true, message: "Photo updated." };
  } catch (e) { return fail(e); }
}

export async function deleteGalleryImage(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const g = await prisma.galleryImage.delete({ where: { id } });
    await deleteUpload(g.image);
    refresh();
    return { ok: true, message: "Photo removed." };
  } catch (e) { return fail(e); }
}

/* ───────────── Devotions ───────────── */

const devotionSchema = z.object({
  title: z.string().trim().min(2, "Add a title").max(200),
  scripture: z.string().trim().max(300).default(""),
  content: z.string().trim().min(10, "Write the devotion text"),
  author: z.string().trim().max(80).default("School Chaplain"),
  pdf: z.string().trim().default(""),
  date: z.string().min(1, "Pick a date"),
  published: z.boolean().default(true),
});

export async function saveDevotion(id: string | null, input: z.input<typeof devotionSchema>): Promise<Result> {
  await requireAdmin();
  try {
    const { date, ...rest } = devotionSchema.parse(input);
    const data = { ...rest, date: new Date(date + "T08:00:00") };
    if (id) {
      const prev = await prisma.devotion.findUniqueOrThrow({ where: { id } });
      await prisma.devotion.update({ where: { id }, data });
      if (prev.pdf !== data.pdf) await deleteUpload(prev.pdf);
    } else await prisma.devotion.create({ data });
    refresh();
    return { ok: true, message: id ? "Devotion updated." : "Devotion published." };
  } catch (e) { return fail(e); }
}

export async function deleteDevotion(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const d = await prisma.devotion.delete({ where: { id } });
    await deleteUpload(d.pdf);
    refresh();
    return { ok: true, message: "Devotion deleted." };
  } catch (e) { return fail(e); }
}

/* ───────────── Messages ───────────── */

export async function setMessageRead(id: string, read: boolean): Promise<Result> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<Result> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Message deleted." };
}

/* ───────────── Account & users ───────────── */

export async function changePassword(current: string, next: string): Promise<Result> {
  const me = await requireAdmin();
  try {
    if (next.length < 8) throw new Error("New password must be at least 8 characters.");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!(await bcrypt.compare(current, user.password))) throw new Error("Current password is incorrect.");
    await prisma.user.update({ where: { id: me.id }, data: { password: await bcrypt.hash(next, 12) } });
    return { ok: true, message: "Password changed." };
  } catch (e) { return fail(e); }
}

const userSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createUser(input: z.input<typeof userSchema>): Promise<Result> {
  await requireAdmin();
  try {
    const d = userSchema.parse(input);
    if (await prisma.user.findUnique({ where: { email: d.email } })) throw new Error("Someone with that email already has an account.");
    await prisma.user.create({ data: { ...d, password: await bcrypt.hash(d.password, 12), role: "admin" } });
    revalidatePath("/admin/account");
    return { ok: true, message: `${d.name} can now sign in.` };
  } catch (e) { return fail(e); }
}

export async function deleteUser(id: string): Promise<Result> {
  const me = await requireAdmin();
  if (me.id === id) return { ok: false, error: "You can't remove your own account." };
  if ((await prisma.user.count()) <= 1) return { ok: false, error: "At least one admin account must remain." };
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/account");
  return { ok: true, message: "Account removed." };
}
