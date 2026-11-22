/**
 * Returns the PostgreSQL connection string. Either set the parts separately (easier in hosting panels;
 * passwords with symbols are encoded safely, and these take priority):
 *   DB_HOST (default localhost), DB_PORT (default 5432), DB_NAME, DB_USER, DB_PASSWORD
 * or set DATABASE_URL directly (used when DB_NAME/DB_USER aren't set — e.g. local development).
 * Also writes the result into process.env.DATABASE_URL so every part of the app sees the same value.
 */
function resolveDatabaseUrl(env = process.env) {
  // Separate DB_* settings win over DATABASE_URL, so a leftover DATABASE_URL in an old .env can't hijack the site.
  if (!env.DB_NAME || !env.DB_USER) return (env.DATABASE_URL || "").trim();
  const enc = encodeURIComponent;
  const host = (env.DB_HOST || "localhost").trim();
  const port = (env.DB_PORT || "5432").trim();
  const auth = env.DB_PASSWORD ? `${enc(env.DB_USER.trim())}:${enc(env.DB_PASSWORD)}` : enc(env.DB_USER.trim());
  const url = `postgresql://${auth}@${host}:${port}/${enc(env.DB_NAME.trim())}?schema=public`;
  env.DATABASE_URL = url;
  env.DATABASE_URL_SOURCE = "built from DB_* settings";
  return url;
}
module.exports = { resolveDatabaseUrl };
