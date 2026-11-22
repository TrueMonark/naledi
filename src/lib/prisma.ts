import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// One PrismaClient for the whole app; reused across hot reloads in dev so we don't exhaust connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** DATABASE_URL, or built from DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD (passwords safely encoded). */
export function databaseUrl() {
  const e = process.env;
  // Separate DB_* settings win, so a leftover DATABASE_URL in an old .env can't override the panel settings.
  if (!e.DB_NAME || !e.DB_USER) return e.DATABASE_URL?.trim() || undefined;
  const enc = encodeURIComponent;
  const auth = e.DB_PASSWORD ? `${enc(e.DB_USER.trim())}:${enc(e.DB_PASSWORD)}` : enc(e.DB_USER.trim());
  return `postgresql://${auth}@${(e.DB_HOST || "localhost").trim()}:${(e.DB_PORT || "5432").trim()}/${enc(e.DB_NAME.trim())}?schema=public`;
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: databaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
