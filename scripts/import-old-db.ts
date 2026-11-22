/**
 * Copies content from the OLD Naledi database (the Express + Prisma version) into this one.
 *
 *   OLD_DATABASE_URL="postgresql://…/old_db" npx tsx scripts/import-old-db.ts           # dry run: shows what it would copy
 *   OLD_DATABASE_URL="postgresql://…/old_db" npx tsx scripts/import-old-db.ts --apply   # actually copies
 *
 * The old schema file wasn't available when this was written, so the script inspects the old
 * database and matches tables/columns by their likely names (e.g. Blog/BlogPost, imageUrl/image).
 * Always run the dry run first and read the mapping it prints. Safe to re-run: rows are upserted by id.
 *
 * Old uploaded files: copy the old `server/uploads/` folder to `./uploads/` — the URLs (/uploads/…) stay the same.
 */
import { loadEnv } from "../prisma/load-env";
loadEnv();
import pg from "pg";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/utils";

const APPLY = process.argv.includes("--apply");
const oldUrl = process.env.OLD_DATABASE_URL;
if (!oldUrl) { console.error("Set OLD_DATABASE_URL to the old database's connection string."); process.exit(1); }

const old = new pg.Client({ connectionString: oldUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

type Row = Record<string, unknown>;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function findTable(candidates: string[]) {
  const { rows } = await old.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`);
  const names = rows.map((r) => r.table_name as string);
  for (const c of candidates) { const hit = names.find((n) => norm(n) === norm(c)); if (hit) return hit; }
  return null;
}

function pick(row: Row, ...keys: string[]): unknown {
  const map = Object.fromEntries(Object.keys(row).map((k) => [norm(k), k]));
  for (const k of keys) { const real = map[norm(k)]; if (real !== undefined && row[real] !== null && row[real] !== undefined) return row[real]; }
  return undefined;
}
const str = (v: unknown, d = "") => (v === undefined || v === null ? d : String(v));
const bool = (v: unknown, d = true) => (v === undefined || v === null ? d : v === true || v === "true" || v === 1 || v === "published");
const date = (v: unknown) => (v ? new Date(v as string) : new Date());

async function load(label: string, candidates: string[]) {
  const t = await findTable(candidates);
  if (!t) { console.log(`• ${label}: no matching table (looked for ${candidates.join(", ")})`); return [] as Row[]; }
  const { rows } = await old.query(`SELECT * FROM "${t}"`);
  console.log(`• ${label}: ${rows.length} rows from "${t}"  columns: ${rows[0] ? Object.keys(rows[0]).join(", ") : "(empty)"}`);
  return rows as Row[];
}

async function main() {
  await old.connect();
  console.log(APPLY ? "APPLY mode — writing to the new database\n" : "DRY RUN — nothing will be written (add --apply to copy)\n");
  const counts: Record<string, number> = {};

  // Users
  for (const r of await load("Users", ["User", "Users", "Admin"])) {
    const email = str(pick(r, "email")).toLowerCase();
    let password = str(pick(r, "password", "passwordHash"));
    if (!email || !password) continue;
    if (!password.startsWith("$2")) password = await bcrypt.hash(password, 12); // shouldn't happen, but never store plaintext
    const data = { name: str(pick(r, "name", "username", "fullName"), "Administrator"), email, password, role: str(pick(r, "role"), "admin") };
    if (APPLY) await prisma.user.upsert({ where: { email }, update: { password: data.password, name: data.name }, create: data });
    counts.users = (counts.users ?? 0) + 1;
  }

  // Blog posts
  const usedSlugs = new Set<string>();
  for (const r of await load("Blog posts", ["Blog", "BlogPost", "Blogs", "Post", "Posts", "News"])) {
    const title = str(pick(r, "title"));
    if (!title) continue;
    let slug = str(pick(r, "slug")) || slugify(title) || "post";
    while (usedSlugs.has(slug)) slug += "-2";
    usedSlugs.add(slug);
    const content = str(pick(r, "content", "body", "text", "description"));
    const id = str(pick(r, "id"));
    const data = {
      title, slug, content: content || title,
      excerpt: str(pick(r, "excerpt", "summary")) || content.replace(/\s+/g, " ").slice(0, 180),
      image: str(pick(r, "image", "imageUrl", "featuredImage", "coverImage", "photo")),
      author: str(pick(r, "author", "authorName"), "Naledi School"),
      category: str(pick(r, "category", "tag"), "News"),
      published: bool(pick(r, "published", "isPublished", "status")),
      createdAt: date(pick(r, "createdAt", "date", "publishedAt")),
    };
    if (APPLY) await prisma.blogPost.upsert({ where: { id }, update: data, create: { id, ...data } });
    counts.posts = (counts.posts ?? 0) + 1;
  }

  // Gallery
  for (const r of await load("Gallery", ["Gallery", "GalleryImage", "GalleryImages", "Image", "Photo", "Photos"])) {
    const image = str(pick(r, "image", "imageUrl", "url", "src", "path"));
    if (!image) continue;
    const id = str(pick(r, "id"));
    const data = {
      image, title: str(pick(r, "title", "name", "caption"), "Photo"),
      description: str(pick(r, "description", "caption")),
      category: str(pick(r, "category", "album"), "General"),
      createdAt: date(pick(r, "createdAt", "date")),
    };
    if (APPLY) await prisma.galleryImage.upsert({ where: { id }, update: data, create: { id, ...data } });
    counts.gallery = (counts.gallery ?? 0) + 1;
  }

  // Devotions
  for (const r of await load("Devotions", ["Devotion", "Devotions"])) {
    const title = str(pick(r, "title"));
    if (!title) continue;
    const id = str(pick(r, "id"));
    const data = {
      title,
      scripture: str(pick(r, "scripture", "verse", "bibleVerse", "reference")),
      content: str(pick(r, "content", "body", "text", "message", "description"), title),
      author: str(pick(r, "author", "authorName"), "School Chaplain"),
      pdf: str(pick(r, "pdf", "pdfUrl", "file", "fileUrl", "document")),
      date: date(pick(r, "date", "createdAt")),
      published: bool(pick(r, "published", "isPublished")),
    };
    if (APPLY) await prisma.devotion.upsert({ where: { id }, update: data, create: { id, ...data } });
    counts.devotions = (counts.devotions ?? 0) + 1;
  }

  // Contact messages
  for (const r of await load("Messages", ["Contact", "ContactMessage", "Contacts", "Message", "Messages"])) {
    const email = str(pick(r, "email"));
    const message = str(pick(r, "message", "body", "content"));
    if (!email || !message) continue;
    const id = str(pick(r, "id"));
    const data = {
      name: str(pick(r, "name", "fullName"), "Unknown"), email, message,
      phone: str(pick(r, "phone", "phoneNumber")), subject: str(pick(r, "subject")),
      read: bool(pick(r, "read", "isRead"), false), createdAt: date(pick(r, "createdAt", "date")),
    };
    if (APPLY) await prisma.contactMessage.upsert({ where: { id }, update: data, create: { id, ...data } });
    counts.messages = (counts.messages ?? 0) + 1;
  }

  // Page content: copy values for page/section pairs that exist in the new schema; the old "introVideo" becomes the homepage video.
  for (const r of await load("Page content", ["PageContent"])) {
    const page = str(pick(r, "page")), section = str(pick(r, "section")), value = str(pick(r, "value"));
    if (!page || !section || !value) continue;
    if (page === "home" && section === "introVideo") {
      if (APPLY) await prisma.videoSetting.upsert({ where: { id: "homepage" }, update: { url: value, sourceType: "upload", enabled: true }, create: { id: "homepage", url: value, enabled: true } });
      console.log(`  → home/introVideo moved to Homepage Video (${value})`);
      continue;
    }
    if (APPLY) await prisma.pageContent.updateMany({ where: { page, section }, data: { value } });
    counts.content = (counts.content ?? 0) + 1;
  }

  console.log(`\n${APPLY ? "Copied" : "Would copy"}:`, counts);
  if (!APPLY) console.log("Run again with --apply to copy. Run `npm run db:seed` first so the content rows exist.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await old.end(); await prisma.$disconnect(); });
