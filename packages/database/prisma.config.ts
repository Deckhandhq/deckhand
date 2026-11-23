import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// The Prisma CLI (via bunx) does not automatically load the root .env.
// The explicit path; variables already present in the environment
// (Docker Compose, CI) are not overridden.
config({ path: new URL("../../.env", import.meta.url).pathname });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    // Direct process.env rather than env(): `prisma generate` must work
    // even without DATABASE_URL (CI, installation).
    url: process.env.DATABASE_URL ?? "",
  },
});
