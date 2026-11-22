import { NextResponse } from "next/server";
import { Client } from "pg";
import { databaseUrl } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Plain-English status check for the hosting setup: open /api/health in a browser.
 * Shows only whether each setting is present (never its value) and a friendly reason if the
 * database can't be reached. No passwords, hosts, usernames or raw error text are returned.
 */
const SETTINGS = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "DATABASE_URL", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD", "SITE_URL"] as const;

function explain(err: unknown): string {
  const e = err as { code?: string; message?: string };
  const msg = e.message ?? "";
  switch (e.code) {
    case "28P01": return "The database rejected the username or password. Re-copy DB_USER and DB_PASSWORD from iPanel → Databases, Save variables, then Restart app.";
    case "28000": return "The database user isn't allowed to connect. Check DB_USER is the full username from iPanel → Databases (and that it's assigned to the database under Users).";
    case "3D000": return "The database name doesn't exist. DB_NAME must be the FULL name shown in iPanel → Databases (including the iwnd_407_ prefix).";
    case "ECONNREFUSED": return "Nothing is accepting database connections at DB_HOST/DB_PORT. The database probably isn't on 'localhost' — find the correct host in iPanel → Databases (or phpPgAdmin) and set DB_HOST to it.";
    case "ENOTFOUND":
    case "EAI_AGAIN": return "DB_HOST isn't a valid server name. Copy the exact database host from iPanel → Databases.";
    case "ETIMEDOUT": return "The database server didn't answer in time. DB_HOST or DB_PORT is probably wrong, or a firewall blocks it.";
    case "42P01": return "Connected, but the tables don't exist yet. Restart the app once — the tables are created automatically on start.";
  }
  if (/password must be a string/i.test(msg)) return "DB_PASSWORD is missing or empty in the Environment settings.";
  if (/self[- ]signed|SSL|ssl/i.test(msg)) return "The database requires an SSL connection. Ask for help — this needs a small setting change.";
  return `Unexpected database error (${e.code ?? "no code"}). Send this message for help.`;
}

export async function GET() {
  const settings: Record<string, boolean | string> = Object.fromEntries(SETTINGS.map((k) => [k, Boolean(process.env[k]?.trim())]));
  if (process.env.DATABASE_URL_SOURCE) settings.DATABASE_URL = process.env.DATABASE_URL_SOURCE;
  const result: Record<string, unknown> = { website: "running", node: process.version, settings };

  const url = databaseUrl();
  if (!url) {
    result.database = "not configured";
    result.fix = "Add DB_NAME, DB_USER, DB_PASSWORD and DB_HOST in iPanel → Node.js → Environment, Save variables, then Restart app.";
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  const client = new Client({ connectionString: url, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    result.database = "connected";
    try {
      const { rows: [m] } = await client.query(`SELECT count(*)::int AS n FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`);
      const { rows: [u] } = await client.query(`SELECT count(*)::int AS n FROM "User"`);
      result.tables = `${m.n} migration(s) applied`;
      result.adminAccounts = u.n;
      if (u.n === 0) result.fix = "No admin account yet: set ADMIN_EMAIL and ADMIN_PASSWORD in Environment, Save variables, then Restart app.";
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
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
