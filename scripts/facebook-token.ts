/**
 * Turns the short-lived token from Meta's Graph API Explorer into a long-lived PAGE token,
 * and prints the two lines to paste into .env. See docs/facebook-setup.md (step 5).
 *
 *   npm run fb:token -- APP_ID APP_SECRET SHORT_LIVED_USER_TOKEN
 */
import { loadEnv } from "../prisma/load-env";
loadEnv();

const [appId, appSecret, userToken] = process.argv.slice(2).filter((a) => a !== "--");
const version = process.env.FACEBOOK_GRAPH_VERSION?.trim() || "v26.0";
const base = process.env.FACEBOOK_GRAPH_BASE_URL || "https://graph.facebook.com"; // override only for tests

if (!appId || !appSecret || !userToken) {
  console.log(`
Usage:
  npm run fb:token -- APP_ID APP_SECRET SHORT_LIVED_USER_TOKEN

  APP_ID / APP_SECRET  → developers.facebook.com → your app → App settings → Basic
  USER TOKEN           → Graph API Explorer → "Generate Access Token" (see docs/facebook-setup.md)
`);
  process.exit(1);
}

async function get(path: string, params: Record<string, string>) {
  const url = new URL(`${base}/${version}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  const body = (await res.json().catch(() => ({}))) as Record<string, any>;
  if (!res.ok || body.error) throw new Error(body.error?.message ?? `HTTP ${res.status}`);
  return body;
}

async function main() {
  console.log("1/3  Exchanging for a long-lived user token…");
  const long = await get("oauth/access_token", {
    grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: userToken,
  });

  console.log("2/3  Looking up the Pages you manage…");
  const pages = await get("me/accounts", { fields: "id,name,access_token,tasks", access_token: long.access_token });
  const list = (pages.data ?? []) as { id: string; name: string; access_token: string; tasks?: string[] }[];
  if (!list.length) {
    console.log("\n✗ No Pages found. When generating the token, make sure you ticked the school's Page and granted pages_show_list.");
    process.exit(1);
  }

  console.log("3/3  Checking token expiry…\n");
  for (const p of list) {
    let expires = "unknown";
    try {
      const dbg = await get("debug_token", { input_token: p.access_token, access_token: `${appId}|${appSecret}` });
      expires = !dbg.data?.expires_at ? "never" : new Date(dbg.data.expires_at * 1000).toLocaleString();
    } catch {}
    const canPost = !p.tasks || p.tasks.includes("CREATE_CONTENT");
    console.log(`── ${p.name} ${canPost ? "" : "  (⚠ you can't create posts on this Page)"}`);
    console.log(`   Token expires: ${expires}`);
    console.log(`   Paste into .env:\n`);
    console.log(`FACEBOOK_PAGE_ID="${p.id}"`);
    console.log(`FACEBOOK_PAGE_ACCESS_TOKEN="${p.access_token}"\n`);
  }
  console.log("Then stop the site (Ctrl+C), run `npm run dev` again, and use Admin → News → Test connection.");
  console.log("Keep the token private — anyone with it can post on the Page.");
}

main().catch((e) => { console.error(`\n✗ ${e.message}`); process.exit(1); });
