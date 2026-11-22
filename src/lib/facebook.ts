import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/storage";

/**
 * Posts to a Facebook PAGE through the Graph API. (Facebook does not allow apps to post to
 * personal profiles.) Setup: docs/facebook-setup.md. Configure in .env:
 *   FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN, optional FACEBOOK_GRAPH_VERSION
 */
export function facebookConfig() {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  if (!pageId || !token) return null;
  return { pageId, token, version: process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v26.0" };
}

type GraphError = { error?: { message?: string; code?: number; error_subcode?: number; type?: string } };

function explain(e: GraphError["error"]): string {
  const code = e?.code;
  if (code === 190) return "Facebook says the access token is invalid or expired. Make a new Page token (docs/facebook-setup.md, steps 4–6) and update FACEBOOK_PAGE_ACCESS_TOKEN in .env, then restart the site.";
  if (code === 200 || code === 10 || code === 3) return `Facebook refused permission (${e?.message}). Make sure the token is a PAGE token with pages_manage_posts, and that your account can create content on the Page.`;
  if (code === 100 && /page/i.test(e?.message ?? "")) return `Facebook couldn't find that Page — check FACEBOOK_PAGE_ID. (${e?.message})`;
  if (code === 368 || code === 32 || code === 4) return `Facebook is temporarily limiting posts — try again later. (${e?.message})`;
  return `Facebook error: ${e?.message ?? "unknown error"}`;
}

async function graph(pathname: string, init?: RequestInit & { query?: Record<string, string> }) {
  const cfg = facebookConfig();
  if (!cfg) throw new Error("Facebook isn't set up yet. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to .env (see docs/facebook-setup.md).");
  // FACEBOOK_GRAPH_BASE_URL is only for automated tests against a fake Graph server.
  const base = process.env.FACEBOOK_GRAPH_BASE_URL || "https://graph.facebook.com";
  const url = new URL(`${base}/${cfg.version}/${pathname}`);
  for (const [k, v] of Object.entries(init?.query ?? {})) url.searchParams.set(k, v);
  if (!init?.body) url.searchParams.set("access_token", cfg.token);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(60_000) });
  } catch (err) {
    throw new Error(`Couldn't reach Facebook — check your internet connection. (${(err as Error).message})`);
  }
  const body = (await res.json().catch(() => ({}))) as GraphError & Record<string, unknown>;
  if (!res.ok || body.error) throw new Error(explain(body.error));
  return body;
}

/** Checks the credentials and returns the Page's name. */
export async function facebookPageInfo() {
  const cfg = facebookConfig()!;
  const body = await graph(cfg.pageId, { query: { fields: "name,link" } });
  return { name: String(body.name ?? ""), link: String(body.link ?? `https://www.facebook.com/${cfg.pageId}`) };
}

/** True when the site address is reachable from the internet (not localhost / a LAN address). */
function publicSiteUrl(): string | null {
  const raw = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL)?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(u.hostname) || u.hostname.endsWith(".local")) return null;
    return u.origin;
  } catch { return null; }
}

export type ShareablePost = { title: string; slug: string; excerpt: string; content: string; image: string };

export function buildFacebookMessage(post: ShareablePost) {
  const site = publicSiteUrl();
  if (site) return `${post.title}\n\n${post.excerpt}\n\nRead more: ${site}/news/${post.slug}`;
  // Running locally: Facebook visitors can't open a localhost link, so post the whole story.
  const body = post.content.length > 5000 ? post.content.slice(0, 5000).trimEnd() + "…" : post.content;
  return `${post.title}\n\n${body}`;
}

/** Adds the image to a multipart form: the file itself for local uploads, or its URL for external images. */
async function attachImage(form: FormData, image: string): Promise<boolean> {
  if (image.startsWith("/uploads/")) {
    const file = path.resolve(UPLOAD_ROOT, image.replace(/^\/uploads\//, ""));
    if (!file.startsWith(UPLOAD_ROOT + path.sep)) throw new Error("Invalid image path.");
    const bytes = await readFile(file).catch(() => null);
    if (!bytes) return false;
    form.set("source", new Blob([bytes]), path.basename(file));
    return true;
  }
  if (/^https?:\/\//.test(image)) { form.set("url", image); return true; }
  return false;
}

/** Publishes a text-only news post (or one with a single photo). Returns the Facebook post id. */
export async function publishToFacebook(post: ShareablePost): Promise<string> {
  const cfg = facebookConfig();
  if (!cfg) throw new Error("Facebook isn't set up yet. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to .env (see docs/facebook-setup.md).");
  const message = buildFacebookMessage(post);

  if (post.image) {
    const form = new FormData();
    form.set("caption", message);
    form.set("published", "true");
    form.set("access_token", cfg.token);
    if (await attachImage(form, post.image)) {
      const body = await graph(`${cfg.pageId}/photos`, { method: "POST", body: form });
      return String(body.post_id ?? body.id);
    }
  }

  // Text-only post (with a link back to the site when it's online).
  const form = new FormData();
  form.set("message", message);
  form.set("access_token", cfg.token);
  const site = publicSiteUrl();
  if (site) form.set("link", `${site}/news/${post.slug}`);
  const body = await graph(`${cfg.pageId}/feed`, { method: "POST", body: form });
  return String(body.id);
}

/* ── Multi-photo posts ─────────────────────────────────────────────────────────
 * Step 1: upload each photo with published=false → Facebook returns a photo id (not visible yet).
 * Step 2: create ONE feed post with attached_media[0..n] = {"media_fbid": id}.
 * Meta doesn't document a maximum number of attached photos, so we try them all in one post and,
 * if Facebook refuses, automatically split them over several posts (10, then 4 photos per post).
 * Unattached unpublished photos are discarded by Facebook after about a day. */

export const FACEBOOK_MAX_PHOTOS = 50;

/** Uploads one photo to the Page without publishing it. Returns the Facebook photo id. */
export async function uploadUnpublishedPhoto(image: string): Promise<string> {
  const cfg = facebookConfig();
  if (!cfg) throw new Error("Facebook isn't set up yet.");
  const form = new FormData();
  form.set("published", "false");
  form.set("access_token", cfg.token);
  if (!(await attachImage(form, image))) throw new Error(`Photo file not found (${image}).`);
  const body = await graph(`${cfg.pageId}/photos`, { method: "POST", body: form });
  return String(body.id);
}

/** Errors that mean "fix your setup", not "too many photos" — splitting won't help with these. */
const isSetupError = (msg: string) => /access token|refused permission|couldn't find that Page|temporarily limiting|Couldn't reach Facebook/i.test(msg);

async function feedPost(message: string, photoIds: string[], link?: string) {
  const cfg = facebookConfig()!;
  const form = new FormData();
  form.set("message", message);
  form.set("access_token", cfg.token);
  photoIds.forEach((id, i) => form.set(`attached_media[${i}]`, JSON.stringify({ media_fbid: id })));
  if (link && !photoIds.length) form.set("link", link);
  const body = await graph(`${cfg.pageId}/feed`, { method: "POST", body: form });
  return String(body.id);
}

/**
 * Creates the Facebook post(s) for already-uploaded photos. Returns every post id created
 * (one id normally; several if the set had to be split).
 */
export async function publishPhotoPost(post: ShareablePost, photoIds: string[]): Promise<{ ids: string[]; posted: number; error?: string }> {
  const message = buildFacebookMessage(post);
  const n = photoIds.length;
  const sizes = [...new Set([n, 10, 4].filter((s) => s <= n))];
  let lastError: Error | null = null;

  for (const size of sizes) {
    const chunks: string[][] = [];
    for (let i = 0; i < n; i += size) chunks.push(photoIds.slice(i, i + size));
    const ids: string[] = [];
    let posted = 0;
    try {
      for (const [i, chunk] of chunks.entries()) {
        const from = i * size + 1, to = from + chunk.length - 1;
        const text = i === 0 ? message : `${post.title} — more photos (${from}–${to} of ${n})`;
        ids.push(await feedPost(text, chunk));
        posted += chunk.length;
      }
      return { ids, posted };
    } catch (e) {
      lastError = e as Error;
      // If part was already posted, stop here rather than double-posting.
      if (ids.length) return { ids, posted, error: lastError.message };
      // Setup problems won't be fixed by splitting.
      if (isSetupError(lastError.message)) throw lastError;
      // Otherwise Facebook probably refused this many photos in one post — try smaller posts.
    }
  }
  throw lastError ?? new Error("Facebook didn't accept the photos.");
}

export const facebookPostUrl = (id: string) => `https://www.facebook.com/${id}`;
