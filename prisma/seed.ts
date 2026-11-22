/**
 * Idempotent seed:
 *  - creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD (only if no user with that email exists)
 *  - creates any missing PageContent rows from src/lib/content-schema.ts (never overwrites edited values,
 *    but keeps labels/types in sync)
 *  - creates the homepage VideoSetting row if missing
 */
import { loadEnv } from "./load-env";
loadEnv();
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CONTENT_SCHEMA } from "../src/lib/content-schema";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: { email, name: process.env.ADMIN_NAME || "Administrator", password: await bcrypt.hash(password, 12), role: "admin" },
      });
      console.log(`✓ Created admin ${email}`);
    } else console.log(`• Admin ${email} already exists (password unchanged)`);
  } else console.warn("! ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped admin user");

  for (const page of CONTENT_SCHEMA) {
    for (const [i, f] of page.fields.entries()) {
      await prisma.pageContent.upsert({
        where: { page_section: { page: page.page, section: f.section } },
        update: { label: f.label, type: f.type, sortOrder: i },
        create: { page: page.page, section: f.section, label: f.label, type: f.type, value: f.value, sortOrder: i },
      });
    }
  }
  console.log(`✓ Site content rows synced (${CONTENT_SCHEMA.reduce((n, p) => n + p.fields.length, 0)} fields)`);

  await prisma.videoSetting.upsert({ where: { id: "homepage" }, update: {}, create: { id: "homepage", enabled: false } });
  console.log("✓ Homepage video settings ready");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
