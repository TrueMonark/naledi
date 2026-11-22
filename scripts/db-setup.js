/**
 * Prepares the database. Runs automatically every time the site starts (see server.js), and can be
 * run by hand with `npm run db:setup`. Safe to run any number of times.
 *
 *  1. Applies any new migrations from prisma/migrations, recording them exactly like
 *     `prisma migrate deploy` does (same _prisma_migrations table), so the two can be mixed.
 *  2. Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if there are no admin accounts yet.
 *
 * Plain JavaScript on purpose: no TypeScript tooling or Prisma CLI needed on the server.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const MIGRATIONS_DIR = path.join(ROOT, "prisma", "migrations");
const LOCK_ID = 72707369; // any constant; stops two app processes migrating at the same time

function log(...a) { console.log("[db-setup]", ...a); }

async function setupDatabase() {
  // Load .env / .env.production the same way Next.js does (hosting-panel variables take priority).
  require("@next/env").loadEnvConfig(ROOT, process.env.NODE_ENV !== "production");
  const url = require("./database-url").resolveDatabaseUrl();
  if (!url) throw new Error("Database settings are missing. Add DB_NAME, DB_USER, DB_PASSWORD (and DB_HOST) — or DATABASE_URL — in the hosting panel's environment variables.");

  const { Client } = require("pg");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    await client.query(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" VARCHAR(36) PRIMARY KEY NOT NULL,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )`);
    const { rows } = await client.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`
    );
    const applied = new Set(rows.map((r) => r.migration_name));
    const pending = fs.readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(MIGRATIONS_DIR, d.name, "migration.sql")))
      .map((d) => d.name)
      .sort()
      .filter((name) => !applied.has(name));

    for (const name of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"));
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      log(`applying migration ${name}…`);
      await client.query("BEGIN");
      try {
        await client.query(sql.toString("utf8"));
        await client.query(
          `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
           VALUES ($1, $2, now(), $3, now(), 1)`,
          [crypto.randomUUID(), checksum, name]
        );
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${name} failed: ${e.message}`);
      }
    }
    log(pending.length ? `${pending.length} migration(s) applied` : "database is up to date");

    // First admin account
    const { rows: [{ count }] } = await client.query(`SELECT count(*)::int AS count FROM "User"`);
    if (count === 0) {
      const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || "";
      if (email && password) {
        const bcrypt = require("bcryptjs");
        await client.query(
          `INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, 'admin', now(), now())`,
          [crypto.randomUUID(), process.env.ADMIN_NAME || "Site Administrator", email, await bcrypt.hash(password, 12)]
        );
        log(`created first admin account ${email}`);
      } else {
        log("no admin accounts yet — set ADMIN_EMAIL and ADMIN_PASSWORD and restart to create one");
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    await client.end();
  }
}

module.exports = { setupDatabase };

if (require.main === module) {
  setupDatabase().then(() => log("done"), (e) => { console.error("[db-setup] ERROR:", e.message); process.exit(1); });
}
