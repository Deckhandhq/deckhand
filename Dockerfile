FROM oven/bun:1.4.5 AS base
WORKDIR /app

# 1. Dépendances (cache Docker)
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN bun install --frozen-lockfile

# 2. Génération et builds
FROM deps AS build
COPY . .
RUN bun run --filter @deckhand/database db:generate \
 && bun run --filter @deckhand/api build \
 && bun run --filter @deckhand/web build

# 3. API : Bun + Prisma CLI pour `migrate deploy` au démarrage
FROM base AS api
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages/database ./packages/database
# dotenv dans prisma.config.ts lit ce fichier ; les variables réelles
# fournies par Compose ne sont pas écrasées.
COPY --from=build /app/.env.example ./.env
EXPOSE 3000
CMD ["sh", "-c", "bun run --filter @deckhand/database db:deploy && bun run --filter @deckhand/api start"]

# 4. Web : serveur SvelteKit standalone exécuté par Bun
FROM base AS web
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/build ./apps/web/build
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["bun", "./build"]
