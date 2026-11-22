import { defineConfig } from "prisma/config";
import { loadEnv } from "./prisma/load-env";

loadEnv();

// DATABASE_URL is only needed for migrate/seed/studio. `prisma generate` (run on npm install)
// works without it, so a fresh clone can install before .env exists.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
