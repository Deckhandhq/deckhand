FROM oven/bun:1.4.5 AS base
WORKDIR /app

# 1. Full dependencies (build: Vite, Prismabox, Storybook…)
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN bun install --frozen-lockfile

# 2. Production dependencies only (runtime)
FROM base AS prod-deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
RUN bun install --frozen-lockfile --production

# 3. Prisma generation and web build (the API stays as TypeScript run by Bun)
FROM deps AS build
COPY . .
RUN bun run --filter @deckhand/database db:generate \
 && bun run --filter @deckhand/web build

# 4. API: Bun + Prisma CLI (`migrate deploy` at startup)
FROM base AS api
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages/database ./packages/database
# dotenv in prisma.config.ts reads this file; the real environment
# provided by Compose is not overridden.
COPY --from=build /app/.env.example ./.env
EXPOSE 3000
CMD ["sh", "-c", "bun run --filter @deckhand/database db:deploy && bun run --filter @deckhand/api start"]

# 5. Web: standalone SvelteKit server run by Bun
FROM base AS web
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/bun.lock ./bun.lock
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/build ./apps/web/build
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["bun", "./build"]
