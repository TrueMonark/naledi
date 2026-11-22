/**
 * Loads .env for Prisma CLI commands and scripts, and explains common Windows mix-ups
 * (".env.txt", values typed into .env.example) when DATABASE_URL can't be found.
 * Also reads .env files saved as UTF-16, which PowerShell and some editors produce.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

function readEnvFile(file: string): string {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le"); // UTF-16 LE (BOM)
  if (buf[0] === 0xfe && buf[1] === 0xff) return Buffer.from(buf.subarray(2)).swap16().toString("utf16le"); // UTF-16 BE
  return buf.toString("utf8").replace(/^﻿/, ""); // UTF-8 (with or without BOM)
}

export function loadEnv() {
  const cwd = process.cwd();
  const envFile = path.join(cwd, ".env");
  if (fs.existsSync(envFile)) {
    const parsed = dotenv.parse(readEnvFile(envFile));
    for (const [k, v] of Object.entries(parsed)) if (process.env[k] === undefined) process.env[k] = v;
  }
  if (process.env.DB_NAME && process.env.DB_USER) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("../scripts/database-url").resolveDatabaseUrl();
  }
  if (process.env.DATABASE_URL) return;

  const hints: string[] = [];
  if (!fs.existsSync(envFile)) {
    hints.push(`No .env file in ${cwd}`);
    if (fs.existsSync(envFile + ".txt")) hints.push(`Found ".env.txt" — rename it to ".env" (Windows hid the .txt): Rename-Item .env.txt .env`);
    if (fs.existsSync(path.join(cwd, ".env.example"))) hints.push(`Create it from the template: Copy-Item .env.example .env   then put your values in .env (not .env.example)`);
  } else {
    hints.push(`.env exists but has no DATABASE_URL line — check the spelling and that the line isn't commented out with #`);
  }
  console.warn(`\n⚠ DATABASE_URL is not set.\n  - ${hints.join("\n  - ")}\n  (Only needed for migrate/seed/dev — npm install works without it.)\n`);
}
