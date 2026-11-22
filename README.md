# Naledi Day and Boarding School — website

Public website + admin dashboard for Naledi Day and Boarding School.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma 7 · PostgreSQL

One app: no separate Express server, no separate API to keep in sync. Pages read the database directly
on the server; the admin saves through server actions.

---

## What's in it

**Public site:** Home (hero slider, homepage video, welcome, "why Naledi", latest news, gallery strip, latest devotion) ·
About · Admissions & requirements (steps, checklists, downloadable PDFs, FAQ) · Gallery (albums + lightbox) ·
News (+ article pages) · Devotions (+ detail pages, optional PDF) · Contact (form → admin inbox, optional email).

Old URLs redirect automatically: `/blog` → `/news`, `/requirements` → `/admissions`, `/devotion` → `/devotions`.

**Admin (`/admin`):**

| Screen | What it does |
|---|---|
| Dashboard | Counts, video status, quick actions, latest messages |
| **Homepage Video** | Upload a video **or** paste a YouTube / direct link · title & caption · cover image · autoplay / muted / loop · show/hide switch · live preview |
| Site Content | Every piece of text and every photo on every page, grouped by page (school details, hero slides, home, about, admissions, page banners) |
| News | Write/edit/hide/delete posts with up to 50 photos each (cover + photo set) · **share to the school's Facebook Page** with all photos |
| Gallery | Upload many photos at once into albums, edit captions, set order |
| Devotions | Add devotions with scripture, date and optional PDF |
| Messages | Inbox for the contact form, mark read/unread, reply by email |
| Account & Users | Change password, add/remove admin users |

---

## Run it locally

Requirements: **Node 20.9+** and **PostgreSQL 14+**.

```bash
cp .env.example .env              # Windows PowerShell: Copy-Item .env.example .env
                                  # then fill in DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate deploy         # creates the tables
npm run db:seed                   # creates the first admin + the editable content rows
npm run dev                       # http://localhost:3000   admin: http://localhost:3000/admin
```

Example `DATABASE_URL` for a local Postgres on Windows:
`postgresql://naledi_app:YOUR_PASSWORD@localhost:5432/naledi_school?schema=public`
(the database must already exist — create it in pgAdmin or with `createdb`).

Generate a JWT secret with `openssl rand -hex 32` (or any long random string).

## Sharing News posts to Facebook

Admins can share a News post to the school's **Facebook Page**, either when publishing (switch on
"Also share on Facebook") or later with the **Share** button in Admin → News. The photo is uploaded with the story,
so it works while the site runs locally. Facebook only allows posting to Pages, not personal profiles.

Setup takes about 15 minutes and is described step by step in **[docs/facebook-setup.md](docs/facebook-setup.md)**.
In short: create a Meta app → generate a token in the Graph API Explorer → run
`npm run fb:token -- APP_ID APP_SECRET TOKEN` → paste the two printed lines into `.env` → restart.
Until then the site works normally and the News screen just says Facebook isn't set up.

## Moving your existing data across

If the old site (Express + Prisma/Postgres) has posts, photos and devotions you want to keep:

```bash
# 1. Dry run — prints which old tables/columns it found and what it would copy
OLD_DATABASE_URL="postgresql://user:pass@host:5432/old_db" npm run db:import-old

# 2. Copy for real (safe to re-run)
OLD_DATABASE_URL="postgresql://user:pass@host:5432/old_db" npm run db:import-old -- --apply
```

Then copy the old `server/uploads/` folder to `./uploads/` in this project. Image/video links keep the same
`/uploads/...` paths, so nothing needs re-uploading. The old `home/introVideo` value becomes the homepage video.
Old admin accounts and passwords carry over.

## Putting it online on Imbra

Step-by-step for Imbra's iPanel (Node.js hosting): **[docs/deploy-imbra.md](docs/deploy-imbra.md)**.
In short: create a PostgreSQL database → upload the zip in Files → add the settings in Node.js → Environment →
startup file `server.js` → Command runner `npm install` + `npm run build` → Restart app. Tables and the first admin
are created automatically on start.

## Deploying (any other host)

Any Node host with a PostgreSQL database works (a VPS, Render, Railway, DigitalOcean App Platform, etc.):

```bash
npm ci
npm run build
npm start      # = node server.js: applies database migrations, creates the first admin, serves on PORT (3000)
```

**Uploads need a persistent disk.** Uploaded photos, videos and PDFs are saved to `./uploads` (or `UPLOAD_DIR`).
On Render/Railway attach a persistent volume and point `UPLOAD_DIR` at it. Serverless hosts like Vercel have no
persistent disk. To use one, swap the two functions in `src/lib/storage.ts` for S3 / Cloudflare R2 / Vercel Blob.
(Large videos are best put on YouTube and linked from Admin → Homepage Video anyway.)

If you put Nginx in front, raise its upload limit so videos fit, e.g. `client_max_body_size 250m;`.

## Environment variables

See `.env.example`. Required: `DATABASE_URL`, `JWT_SECRET`. For seeding: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.
Optional: `UPLOAD_DIR`, `MAX_IMAGE_MB` (10), `MAX_VIDEO_MB` (200), SMTP settings to email contact-form messages,
`SITE_URL`, `COOKIE_SECURE`, and `FACEBOOK_PAGE_ID` / `FACEBOOK_PAGE_ACCESS_TOKEN` / `FACEBOOK_GRAPH_VERSION`
for Facebook sharing. `.env.example` is set up for running locally and explains every line.

## Adding a new editable field

Add one line to `src/lib/content-schema.ts`, run `npm run db:seed`, then read it in the page with
`const c = await getContent("<page>")`. It appears in Admin → Site Content automatically.
