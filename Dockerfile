# Bun image aligned with the version that generated the project.
ARG BUN_VERSION=1.4.4
FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /app

# ── Build dependencies (hoisted to avoid isolated linker symlinks) ───────────
FROM base AS build-deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install --frozen-lockfile --linker=hoisted

# ── Build API ────────────────────────────────────────────────────────────────
FROM build-deps AS api-build
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
RUN cd apps/api && bun run contract:emit && bun run build

# ── Build Web ────────────────────────────────────────────────────────────────
FROM build-deps AS web-build
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
RUN cd apps/web && bun --bun run build

# ── API production dependencies (hoisted) ────────────────────────────────────
FROM base AS api-prod-deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install --filter '@dekhand/api' --production --frozen-lockfile --linker=hoisted

# ── Web production dependencies (hoisted) ────────────────────────────────────
FROM base AS web-prod-deps
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install --filter '@dekhand/web' --production --frozen-lockfile --linker=hoisted

# ── Image API ────────────────────────────────────────────────────────────────
FROM base AS api
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=api-prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun packages/shared ./packages/shared
COPY --chown=bun:bun package.json ./package.json
COPY --chown=bun:bun apps/api ./apps/api
COPY --from=api-build --chown=bun:bun /app/apps/api/dist ./apps/api/dist
COPY --from=api-build --chown=bun:bun /app/apps/api/src/prisma ./apps/api/src/prisma
WORKDIR /app/apps/api
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["bun", "run", "start"]

# ── Image Web ────────────────────────────────────────────────────────────────
FROM base AS web
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=web-prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --chown=bun:bun packages/shared ./packages/shared
COPY --chown=bun:bun package.json ./package.json
COPY --chown=bun:bun apps/web/package.json ./apps/web/package.json
COPY --from=web-build --chown=bun:bun /app/apps/web/build ./apps/web/build
WORKDIR /app/apps/web
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["bun", "./build"]

# ── Combined API + Web image (optional, two ports) ──────────────────────────
# Put this stage LAST so that 'docker build .' without --target produces it.
# Advanced users keep using --target api / --target web.
FROM base AS all
ENV NODE_ENV=production
COPY --from=api-prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=web-prod-deps --chown=bun:bun /app/apps/web/node_modules ./apps/web/node_modules 2>/dev/null || true
COPY --chown=bun:bun packages/shared ./packages/shared
COPY --chown=bun:bun package.json ./package.json
COPY --chown=bun:bun apps/api ./apps/api
COPY --chown=bun:bun apps/web/package.json ./apps/web/package.json
COPY --from=api-build --chown=bun:bun /app/apps/api/dist ./apps/api/dist
COPY --from=api-build --chown=bun:bun /app/apps/api/src/prisma ./apps/api/src/prisma
COPY --from=web-build --chown=bun:bun /app/apps/web/build ./apps/web/build
COPY --chown=bun:bun scripts/start-all.ts ./scripts/start-all.ts
WORKDIR /app
USER bun
EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["bun", "-e", "const ok=async(p)=>{try{return (await fetch('http://127.0.0.1:'+p+'/')).ok}catch{return false}}; Promise.all([ok(process.env.API_PORT??3000),ok(process.env.WEB_PORT??3001)]).then(([a,b])=>process.exit(a&&b?0:1))"]
CMD ["bun", "scripts/start-all.ts"]
