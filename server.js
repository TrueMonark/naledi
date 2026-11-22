/**
 * Startup file for hosting panels (Imbra iPanel, cPanel "Setup Node.js App", Passenger, etc.).
 * Set the panel's "startup file" to server.js. Locally you can keep using `npm run dev`.
 *
 * On every start it first brings the database up to date (scripts/db-setup.js), then serves the
 * built site from .next — so run `npm run build` after uploading new code, then restart.
 */
const { createServer } = require("node:http");
const path = require("node:path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
require("@next/env").loadEnvConfig(__dirname, false);
require("./scripts/database-url").resolveDatabaseUrl(); // DB_* parts → DATABASE_URL
const dir = __dirname;
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || "0.0.0.0";

async function main() {
  const fs = require("node:fs");
  if (!fs.existsSync(path.join(dir, ".next", "BUILD_ID"))) {
    throw new Error("The site hasn't been built yet. Run `npm run build` (Command runner), then restart the app.");
  }

  try {
    await require("./scripts/db-setup").setupDatabase();
  } catch (e) {
    // Keep serving (pages fall back to default content) but make the problem obvious in the log.
    console.error("[startup] Database setup failed:", e.message);
  }

  const next = require("next");
  const app = next({ dev: false, dir, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  createServer((req, res) => handle(req, res)).listen(port, hostname, () => {
    console.log(`[startup] Naledi School website ready on http://${hostname}:${port}`);
  });
}

main().catch((e) => {
  console.error("[startup] Could not start:", e.message);
  process.exit(1);
});
