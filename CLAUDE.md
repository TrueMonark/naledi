# CLAUDE.md — Naledi Day and Boarding School website

Marketing/content site + admin panel. NOT a student information system.

## Stack (verified)
- Next.js 15 App Router, React 19, TypeScript strict, Tailwind 4, shadcn/ui (components hand-placed in `src/components/ui`)
- Prisma 7 with the `prisma-client` generator → `src/generated/prisma` (gitignored; created by `prisma generate`/postinstall)
  and the `@prisma/adapter-pg` driver adapter. Datasource URL lives in `prisma.config.ts`, not the schema.
- PostgreSQL. Migrations in `prisma/migrations`. Seed: `prisma/seed.ts` (idempotent).
- Auth: bcrypt passwords + HS256 JWT (jose) in an httpOnly cookie `naledi_session`. One role ("admin").

## Layout
- `src/app/(site)/*` public pages — server components that query Prisma directly. `export const dynamic = "force-dynamic"` in the group layout.
- `src/app/admin/login` + `src/app/admin/(dash)/*` admin. `(dash)/layout.tsx` calls `requireAdmin()`; `src/middleware.ts` redirects unauthenticated /admin requests.
- `src/lib/actions/admin.ts` — ALL admin mutations (server actions). Every action starts with `await requireAdmin()` and returns `Result` (`{ok:true,message}` | `{ok:false,error}`), then `revalidatePath`.
- `src/app/api/admin/upload/route.ts` — the only API route: multipart upload (auth-checked), returns `{url}`. Client helper: `uploadFile()` in `components/admin/media-upload.tsx` (XHR, progress).
- `src/app/uploads/[...path]/route.ts` — serves uploaded files with HTTP Range support (video seeking). Path-traversal guarded.
- `src/lib/storage.ts` — `saveUpload` / `deleteUpload`. Replacing or deleting a record deletes its old file (fixes the orphaned-uploads issue of the old Express version).

## CMS
- `src/lib/content-schema.ts` is the single source of truth for editable static content (page → fields with type + default).
  Admin → Site Content is generated from it. To add a field: add it there, run `npm run db:seed`, read it with `getContent(page)`.
- `getContent()` merges DB values over defaults and falls back to defaults if the DB is unreachable — the site never renders blank.
- List fields are textareas, one item per line; `Title | Description` rows are parsed with `pairs()`.
- Homepage video has its own model (`VideoSetting`, id "homepage") and screen (`/admin/video`): upload | youtube | url, poster, title, caption, autoplay (forces muted), muted, loop, enabled.

## Facebook Page sharing
- `src/lib/facebook.ts` — Graph API client (`publishToFacebook`, `facebookPageInfo`, `buildFacebookMessage`). Env: `FACEBOOK_PAGE_ID`,
  `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_GRAPH_VERSION` (default v26.0). `FACEBOOK_GRAPH_BASE_URL` exists only for tests against a fake server.
- Photos are uploaded as multipart `source` from disk (works on localhost). If `SITE_URL` is public, the message is
  title + excerpt + "Read more" link; on localhost/LAN the full story is posted instead.
- `BlogPost.photos` (String[], ≤50 incl. cover `image`) is the post's photo set — edited with `components/admin/photo-set-editor.tsx`,
  shown on the article via `components/site/gallery-grid.tsx`. Removed/replaced photo files are deleted on save.
- Multi-photo share is client-driven for progress (`news/facebook-share-dialog.tsx`): `prepareFacebookShare` → `uploadFacebookPhoto`
  per photo (published=false, 3 in parallel) → `finishFacebookShare` (one /feed post with attached_media). Meta documents no max,
  so `publishPhotoPost` falls back to chunks of 10 then 4 if Facebook rejects the set. Text-only posts use `shareToFacebook`.
- `BlogPost.facebookPostId/facebookPostIds/facebookPostedAt/facebookError` track state. `savePost` returns `{ ok, id }`; sharing is a separate step.
- Uploaded images are resized to ≤2048px + EXIF-rotated with sharp in `lib/storage.ts` (falls back to the original on error).
- Setup guide for humans: `docs/facebook-setup.md`; token helper: `npm run fb:token`.

## Production startup (hosting panels, e.g. Imbra iPanel)
- `server.js` is the startup file (`npm start`). It loads env via `@next/env`, turns `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` (these win over DATABASE_URL)
  into `DATABASE_URL` (`scripts/database-url.js`; `src/lib/prisma.ts` does the same), runs `scripts/db-setup.js`, then serves `.next`.
- `scripts/db-setup.js` (plain JS, no Prisma CLI) applies pending `prisma/migrations/*/migration.sql` and records them in
  `_prisma_migrations` like `prisma migrate deploy` (sha256 checksum), under a pg advisory lock; creates the first admin from
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` when the User table is empty. PageContent/VideoSetting rows are not needed (defaults + upserts).
- All packages are in `dependencies` because panels install with NODE_ENV=production. `SITE_URL` (runtime) replaces NEXT_PUBLIC_SITE_URL.
- New migration? Add the folder under `prisma/migrations`; it applies on next restart. Guide: `docs/deploy-imbra.md`.

## Checks before finishing work
1. `npx tsc --noEmit` — must be clean.
2. `npm run build` — must succeed.
3. New admin mutation? Put it in `lib/actions/admin.ts`, start with `requireAdmin()`, return `Result`.
4. New static text/photo? Add to `content-schema.ts` — don't hand-build admin forms.

## Migrating from the old site
`scripts/import-old-db.ts` (dry-run by default, `--apply` to write) copies users/posts/gallery/devotions/messages/page content from `OLD_DATABASE_URL`, matching tables/columns by likely names. Copy old `server/uploads/` to `./uploads/`.
