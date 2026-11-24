import { NextResponse } from "next/server";
import { Client } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Plain-English status check: open /api/health in a browser.
// Shows only whether each setting is present (never its value) and what to fix.
const SETTINGS = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "DATABASE_URL", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "SITE_URL"];

function databaseUrl() {
  const e = process.env;
  if (!e.DB_NAME || !e.DB_USER) return e.DATABASE_URL?.trim() || undefined;
  const enc = encodeURIComponent;
  const auth = e.DB_PASSWORD ? `${enc(e.DB_USER.trim())}:${enc(e.DB_PASSWORD)}` : enc(e.DB_USER.trim());
  return `postgresql://${auth}@${(e.DB_HOST || "localhost").trim()}:${(e.DB_PORT || "5432").trim()}/${enc(e.DB_NAME.trim())}?schema=public`;
}

function explain(err: unknown): string {
  const e = err as { code?: string; message?: string };
  const msg = e.message ?? "";
  if (e.code === "28P01") return "The database rejected the username or password. Re-copy DB_USER and DB_PASSWORD from iPanel > Databases, Save variables, then Restart app.";
  if (e.code === "28000") return "The database user isn't allowed to connect. DB_USER must be the full username from iPanel > Databases.";
  if (e.code === "3D000") return "The database name doesn't exist. DB_NAME must be the FULL name from iPanel > Databases (with the iwnd_407_ prefix).";
  if (e.code === "ECONNREFUSED") return "Nothing accepts database connections at DB_HOST/DB_PORT. The database probably isn't on localhost: find the real host in iPanel > Databases / phpPgAdmin.";
  if (e.code === "ENOTFOUND" || e.code === "EAI_AGAIN") return "DB_HOST isn't a valid server name. Copy the exact database host from iPanel > Databases.";
  if (e.code === "ETIMEDOUT") return "The database server didn't answer. DB_HOST or DB_PORT is probably wrong.";
  if (e.code === "42P01") return "Connected, but the tables don't exist yet. Restart the app once; they are created on start.";
  if (/password must be a string/i.test(msg)) return "DB_PASSWORD is missing or empty.";
  if (/ssl/i.test(msg)) return "The database requires an SSL connection. Ask for help.";
  return `Unexpected database error (${e.code ?? "no code"}).`;
}

export async function GET() {
  const settings: Record<string, boolean | string> = {};
  for (const k of SETTINGS) settings[k] = Boolean(process.env[k]?.trim());
  if (process.env.DATABASE_URL_SOURCE) settings.DATABASE_URL = process.env.DATABASE_URL_SOURCE;
  const result: Record<string, unknown> = { website: "running", node: process.version, settings };
  const noStore = { headers: { "Cache-Control": "no-store" } };

  const url = databaseUrl();
  if (!url) {
    result.database = "not configured";
    result.fix = "Add DB_NAME, DB_USER, DB_PASSWORD and DB_HOST in Node.js > Environment, Save variables, then Restart app.";
    return NextResponse.json(result, noStore);
  }
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    result.database = "connected";
    try {
      const m = await client.query(`SELECT count(*)::int AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`);
      const u = await client.query(`SELECT count(*)::int AS n FROM "User"`);
      result.tables = `${m.rows[0].n} migration(s) applied`;
      result.adminAccounts = u.rows[0].n;
      if (u.rows[0].n === 0) result.fix = "No admin account yet: set ADMIN_EMAIL and ADMIN_PASSWORD, Save variables, then Restart app.";
    } catch (e) {
      result.tables = "missing";
      result.fix = explain(e);
    }
  } catch (e) {
    result.database = "cannot connect";
    result.fix = explain(e);
  } finally {
    await client.end().catch(() => {});
  }
  return NextResponse.json(result, noStore);
}
