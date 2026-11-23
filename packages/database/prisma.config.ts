import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Le CLI Prisma (via bunx) ne charge pas automatiquement le .env racine.
// Le chemin explicite ; les variables déjà présentes dans l'environnement
// (Docker Compose, CI) ne sont pas écrasées.
config({ path: new URL("../../.env", import.meta.url).pathname });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    // process.env direct plutôt que env() : `prisma generate` doit fonctionner
    // même sans DATABASE_URL (CI, installation).
    url: process.env.DATABASE_URL ?? "",
  },
});
