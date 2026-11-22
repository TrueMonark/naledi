# Sharing News posts to Facebook — setup guide

Once this is set up, admins can share a News post to the school's Facebook **Page**:

- When writing a post, switch on **"Also share on Facebook"**, then click **Publish & share**, or
- On an existing post, click **Share** in the Facebook column of **Admin → News**.

All of the post's photos (up to **50**: the cover plus the photo set) are sent to Facebook together with the story,
with a progress window showing each photo going up. A post that's already been shared shows a blue **Shared** badge
that links to it on Facebook.

> **Facebook Page, not personal profile.** Facebook does not let any website or app post to a *personal* profile
> (they removed that in 2018). It has to be a **Facebook Page**, the kind a school, business or organisation has.
> If the school doesn't have one yet, create it first: Facebook → Menu → **Pages** → **Create new Page**.
> You need **full control** of the Page (be an admin).

Meta changes its developer screens often. If a button below is named slightly differently, look for the closest match.
The values you need at the end are always the same: a **Page ID** and a **Page access token**.

---

## Step 1 — Create a Meta developer account

1. Go to <https://developers.facebook.com> and log in with the Facebook account that manages the school Page.
2. Click **Get Started** (top right) and follow the prompts to register as a developer (verify your phone/email if asked).

## Step 2 — Create an app

1. Go to <https://developers.facebook.com/apps> → **Create App**.
2. App name: e.g. `Naledi School Website`. Contact email: yours.
3. When asked for a **use case**, choose **"Manage everything on your Page"** (it may be listed under *Content management*).
   If you're asked for an app *type* instead, choose **Business**.
4. If asked to connect a Business portfolio, you can skip it or pick the school's.
5. Finish creating the app. It stays in **Development mode**, and that's fine: in Development mode the app works for
   you and anyone you add as an app admin, which is all the website needs. **No app review is required** because
   you're only posting to a Page you manage.

## Step 3 — Turn on the Page permissions

1. In your app's dashboard, open **Use cases** → **Manage everything on your Page** → **Customize** (or **Permissions**).
2. Make sure these permissions are **added**:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`
   - `pages_read_user_engagement`
3. Open **App settings → Basic** and note the **App ID** and **App Secret** (click *Show*). You'll need them in step 5.
   Keep the App Secret private.

## Step 4 — Generate a token in the Graph API Explorer

1. Open <https://developers.facebook.com/tools/explorer>.
2. On the right: **Meta App** → choose your app. **User or Page** → *User Token*.
3. Under **Permissions**, add the five permissions from step 3.
4. Click **Generate Access Token**. A Facebook window opens:
   - choose **Opt in to current Pages only** → tick the **school's Page**,
   - make sure all requested permissions are allowed → **Continue / Save**.
5. Copy the token that appears in the **Access Token** box. This is a **short-lived user token** (it lasts about an hour),
   so do step 5 straight away.

## Step 5 — Turn it into a permanent Page token

In PowerShell, from the project folder, run (one line, replace the three values):

```powershell
npm run fb:token -- YOUR_APP_ID YOUR_APP_SECRET PASTE_THE_TOKEN_FROM_STEP_4
```

It prints something like:

```
── Naledi Day and Boarding School
   Token expires: never
   Paste into .env:

FACEBOOK_PAGE_ID="1234567890"
FACEBOOK_PAGE_ACCESS_TOKEN="EAAB…long text…"
```

"Token expires: never" is what you want. Page tokens made this way don't expire under normal use.

<details>
<summary>Doing it by hand instead (without the script)</summary>

1. Open this address in your browser (replace the three values):
   `https://graph.facebook.com/v26.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN`
   Copy the `access_token` from the result. This is the long-lived **user** token.
2. Open `https://graph.facebook.com/v26.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN`
3. Find the school Page in the list: its `id` is `FACEBOOK_PAGE_ID`, its `access_token` is `FACEBOOK_PAGE_ACCESS_TOKEN`.
4. Optional: paste the Page token into <https://developers.facebook.com/tools/debug/accesstoken> and check **Expires: Never**.
</details>

## Step 6 — Add it to `.env` and restart

1. Open `.env` in the project folder and fill in:

   ```
   FACEBOOK_PAGE_ID="1234567890"
   FACEBOOK_PAGE_ACCESS_TOKEN="EAAB…"
   FACEBOOK_GRAPH_VERSION="v26.0"
   ```

2. Save, then in the terminal where the site is running press **Ctrl+C** and start it again with `npm run dev`.
   The site only reads `.env` when it starts.

   **On Imbra (online):** add the same three values in iPanel → naledischool.org → **Node.js → Environment**, Save,
   then **Runtime → Restart app**. Also set `SITE_URL` to `https://naledischool.org` there, so Facebook posts get a "Read more" link.

## Step 7 — Check it works

1. Log in at <http://localhost:3000/admin> → **News**.
2. The box at the top should say **"Facebook sharing is on."** Click **Test connection**. It should reply
   *Connected to the Facebook Page "…"*.
3. Write a test post, switch on **Also share on Facebook**, click **Publish & share**, and check the school Page.
   (You can delete the test post on Facebook afterwards.)

---

## What gets posted

| Situation | What appears on Facebook |
|---|---|
| Post has photos (1–50) | **One** Facebook post with all the photos, cover first, and the title and story as the text |
| Facebook refuses that many photos in one post | It automatically splits them: posts of 10 (or 4), the first with the story, the rest titled "… — more photos (11–20 of 35)". The badge shows e.g. **Shared · 4 posts** |
| No photos | A text post with the title and story |
| Site running **locally** (`SITE_URL` is `http://localhost:3000`) | The **full story** is posted, because Facebook visitors can't open a localhost link |
| Site **online** (`SITE_URL="https://naledischool.org"`) | Title + short summary + a **"Read more"** link to the article on the website |

Photos are uploaded directly from your computer, so sharing works even though the site only runs locally.
Photos are automatically resized to 2048px when you add them to a post, so they stay under Facebook's size limit.
Sending 50 photos takes a minute or two, so keep the progress window open until it says **Shared on Facebook**.
If you click **Stop**, nothing is posted. Photos already sent are discarded by Facebook automatically.

Notes:
- Each post can be shared once. After that it shows **Shared** with a link to the Facebook post.
- Editing a post on the website later does **not** change the Facebook post. Edit it on Facebook if needed.
- Deleting a post on the website does **not** delete it from Facebook.
- A post must be **visible on the website** before it can be shared.

## When something goes wrong

The admin shows Facebook's error in plain words. A red **!** icon next to a post's Share button means the last attempt
failed; hover over it to see why. Common ones:

| Message | Fix |
|---|---|
| *access token is invalid or expired* | Your password changed, the app was removed, or the token was copied wrongly. Repeat steps 4–6. |
| *Facebook refused permission* | The token is a **user** token, not a **Page** token, or a permission from step 3 is missing. Repeat steps 3–6. |
| *couldn't find that Page* | `FACEBOOK_PAGE_ID` is wrong. Copy it again from the step 5 output. |
| *temporarily limiting posts* | Facebook's spam protection. Wait an hour and try again. |
| *Couldn't reach Facebook* | No internet on the computer running the site. |
| *Facebook sharing isn't set up yet* | `.env` values are empty, or you didn't restart the site after adding them. |

## Keep the token safe

The Page access token lets anyone post on the school's Page. Keep it only in `.env`, never in the code, emails or
chats. If it leaks, go to Facebook → Settings → **Business integrations** (or **Apps and websites**), remove the app,
then repeat steps 4–6 to make a new token.
