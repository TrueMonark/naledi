# Putting the website online on Imbra (iPanel)

This replaces the current naledischool.org site on your Imbra Web Node (`iwnd_407`) with the new version.
The domain and SSL certificate stay as they are.

**What you need:** the file `naledi-school-imbra.zip` and about 30 minutes.
**What you don't need:** a terminal, Git, or any commands on your own computer.

When the site starts it **creates the database tables and your first admin account automatically**,
so there are no database commands to run.

---

## Step 0 — Back up the current site (2 minutes)

The new site replaces the old one in the same folder, so save a copy first.

1. iPanel → **Websites** → **naledischool.org → Manage** → **Files**.
2. Select everything in the site's folder → **Compress** (or **Download**) → download the archive to your computer.
   (If the site's Home page has a **Backups** card, you can make a backup there instead.)

> The old site's posts and photos live in its old database, so they **don't move across automatically**.
> Re-add the ones you want through the new admin, or ask for an import script.

## Step 1 — Create the PostgreSQL database

1. naledischool.org → **Home** → **Databases** → **+ New**.
2. **Engine:** choose **PostgreSQL** (not MySQL).
3. **Database name:** `naledi` (iPanel adds the prefix, so the full name becomes `iwnd_407_naledi`).
4. **Username:** `naledi_user`.
5. **Password:** click the refresh button to generate one, then the eye button to see it, and **copy it somewhere safe**.
6. Click **Create database**.
7. In the database list, the names are cut short on screen, so use the small **copy** buttons next to the
   **database name** and the **username** to get them in full. The host is usually `localhost`.
   You'll need the name, username, password and host in Step 3.

## Step 2 (recommended) — Get the code with "Deploy using Git"

The code lives on GitHub at **https://github.com/TrueMonark/naledi**, branch **`nextjs`**, so Imbra downloads it
directly and nothing needs uploading from your computer.

1. naledischool.org → **Home** → **Deploy using Git**.
2. **Repository URL:** `https://github.com/TrueMonark/naledi.git`
3. **Branch:** `nextjs` (not `main`, which still has the old site).
4. The repo is public, so no username/password/token is needed. If iPanel asks for one, leave it empty.
5. Deploy / Pull. Afterwards open **Files** and check that `package.json`, `server.js`, `src` and `prisma` are in the
   application folder, and that **`.htaccess`, `cgi-bin` and `.node-version` are still there**. If the deploy removed
   `.htaccess`, restore it from your Step 0 backup. Delete the old **`.env`** if it's still there.

**Updating later:** push changes to the `nextjs` branch → iPanel **Pull** → Command runner `npm install` + `npm run build`
→ **Restart app**.

Then continue with Step 3. (Skip "Step 2 — Upload the new site" below. That's the alternative without Git.)

## Step 2 (alternative) — Upload the new site as a zip

1. naledischool.org → **Files**. Open the site's application folder (the one the old site's files are in).
2. Delete the old site's files and folders (you backed them up in Step 0), **except these. Keep them:**
   - `.htaccess`: connects the domain to the Node.js app
   - `cgi-bin`: belongs to the hosting
   - `.node-version`: tells the hosting which Node version to use
     (open it: it should say `20` or higher, e.g. `20.20.2`; change it if it says 18 or lower)

   Do delete the old **`.env`**. The new site gets its settings from the Environment tab (Step 3), and an old
   `.env` could feed it the old site's settings.
   **If there is an `uploads` folder from an earlier version of *this* new site, keep that too.**
3. **Upload** `naledi-school-imbra.zip` into that folder, then **Extract** it there.
4. Check that `package.json`, `server.js` and the `src` and `prisma` folders are directly in the application folder,
   **not** inside an extra sub-folder. If they ended up in a sub-folder, move them up one level.
5. Delete the zip file afterwards.

## Step 3 — Settings (Node.js → Environment tab)

naledischool.org → **Node.js** → **Environment**. Add each of these and **Save**:

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DB_HOST` | the host from Step 1 (usually `localhost`) |
| `DB_PORT` | `5432` |
| `DB_NAME` | the full database name from Step 1, e.g. `iwnd_407_naledi` |
| `DB_USER` | the full username from Step 1 |
| `DB_PASSWORD` | the password from Step 1, copied exactly |
| `JWT_SECRET` | a long random string (see below) |
| `ADMIN_EMAIL` | the email you'll log in with, e.g. `admin@naledischool.org` |
| `ADMIN_PASSWORD` | a strong first password (you'll change it after logging in) |
| `ADMIN_NAME` | your name |
| `SITE_URL` | `https://naledischool.org` |

**Making a `JWT_SECRET`:** in PowerShell on your computer, run
`[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")` and paste the 64-character result.
Use a **new** one, not the one from your local `.env`.

Later, for Facebook sharing, add `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` here too
(see `docs/facebook-setup.md`), then **Restart app**.

Don't upload your local `.env` file. These settings replace it on the server.

## Step 4 — Runtime settings (Node.js → Runtime tab)

| Setting | Value |
|---|---|
| Node.js version | **Node 20.20.2** (or a newer 20 / 22 if the list offers one) |
| Application mode | **production** |
| Startup file | **`server.js`** |
| Application root / document root | the folder you uploaded into in Step 2 (normally already set) |

Click **Save**.

## Step 5 — Install and build (Node.js → Command runner tab)

Run these two, one at a time, and wait for each to finish (a few minutes each):

1. `npm install`
2. `npm run build`

If the runner only wants the part after `npm`, type `install`, then `run build`.

The build must end with a list of pages and no "Error". If it stops with **"Killed"** or **"JavaScript heap out of memory"**,
the plan doesn't have enough memory to build. Tell me and I'll give you a version you build on your PC instead.

## Step 6 — Start it and log in

1. **Runtime** tab → **Restart app**.
2. Open <https://naledischool.org>. The new site should appear.
3. Open <https://naledischool.org/admin> and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. Go to **Account & Users** and **change your password** straight away.
   You can then delete `ADMIN_PASSWORD` from the Environment tab. It's only used when there are no admin accounts yet.
5. Fill in **Site Content** (logo, contacts, photos) and add your news, gallery photos and devotions.

## If something isn't right — check the Log Viewer

naledischool.org → **Log Viewer**. The site writes plain-English lines starting with `[startup]` or `[db-setup]`:

| Log line | What to do |
|---|---|
| `[db-setup] 3 migration(s) applied` / `database is up to date` | All good |
| `[db-setup] created first admin account …` | All good. Log in with those details |
| `The site hasn't been built yet` | Run `npm run build` (Step 5), then Restart app |
| `Database settings are missing` | Add the `DB_…` settings (Step 3), Save, Restart app |
| `password authentication failed` | `DB_USER` or `DB_PASSWORD` doesn't match Step 1. Re-copy, Save, Restart |
| `database "…" does not exist` | `DB_NAME` must be the **full** name including the `iwnd_407_` prefix |
| `connect ECONNREFUSED` / `getaddrinfo` | `DB_HOST` is wrong. Use the host shown in the Databases list |
| `no admin accounts yet` | Add `ADMIN_EMAIL` and `ADMIN_PASSWORD`, Save, Restart |
| Login says nothing / loops back to login | Check `JWT_SECRET` is set (at least 16 characters), then Restart |

If a page shows "Application error", or the log shows something not in this list, copy the last ~20 log lines and send them over.

## Updating the site later

1. **Files:** upload the new zip and **Extract**, letting it overwrite the old files.
   **Never delete the `uploads` folder.** It holds every photo, video and PDF uploaded through the admin.
2. **Command runner:** `npm install`, then `npm run build`.
3. **Runtime → Restart app.** Any database changes apply automatically on restart.

## Good to know

- **Big video files:** the hosting may limit how large one upload can be. If a homepage-video upload fails, put the
  video on YouTube and paste the link in **Admin → Homepage Video**. That's also faster for visitors.
- **Photos** are resized automatically when uploaded, so phone photos are fine.
- **Backups:** your content is in the PostgreSQL database plus the `uploads` folder. Back up both now and then
  (Databases → export/dump, and Files → compress `uploads`).
