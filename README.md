# Deckhand

Monorepo 100 % Bun : backend Elysia + Prisma 7, frontend SvelteKit 3, PostgreSQL self-hosté.

## Structure

```
apps/api        API Elysia (monolithe modulaire), exporte `type App`
apps/web        SvelteKit 3 + @sveltejs/adapter-bun, client Eden typé
packages/database  schéma Prisma, client généré, modèles Prismabox
```

Le web appelle l'API sur `/api` : proxy Vite en développement, reverse proxy (Caddy) en production. Même origine, donc pas de CORS à configurer.

## Développement

```bash
bun install
cp .env.example .env
docker compose up -d postgres
bun run db:migrate      # ou db:deploy
bun run dev             # API :3000, web :5173
```

Le client Prisma et les schémas Prismabox sont générés automatiquement avant `dev` (`predev`) et peuvent être régénérés avec `bun run db:generate`.

Endpoints utiles :

- `http://localhost:3000/health` — health check
- `http://localhost:3000/openapi` — documentation Scalar
- `http://localhost:3000/openapi/json` — spec OpenAPI
- `http://localhost:3000/llms.txt` — documentation LLM-friendly

## Typage de bout en bout

`apps/api/src/app.ts` exporte `type App = typeof app` (sans `.listen`). Le front utilise `createApiClient()` (`apps/web/src/lib/api/client.ts`) basé sur `treaty<App>` de `@elysia/eden`, avec `event.fetch` et le cookie transmis en SSR. Les versions d'Elysia sont alignées par le `catalog` du `package.json` racine.

Les schémas de validation sont générés depuis `prisma/schema.prisma` par Prismabox, puis consommés par Elysia (validation runtime), OpenAPI et Eden.

## Self-hosting

```bash
cp .env.example .env      # ajuster DATABASE_URL / ORIGIN si besoin
docker compose up -d --build
```

L'image API applique les migrations (`prisma migrate deploy`) avant de démarrer. Le service `caddy` est optionnel :

```bash
DOMAIN=example.com docker compose --profile proxy up -d
```

## Commandes

| Commande                                                                  | Rôle                                             |
| ------------------------------------------------------------------------- | ------------------------------------------------ |
| `bun run dev`                                                             | API + web en parallèle                           |
| `bun run build` / `bun run start`                                         | builds puis démarrage                            |
| `bun run db:generate` / `db:migrate` / `db:deploy` / `db:seed` / `studio` | Prisma                                           |
| `bun test`                                                                | tests `bun:test` (dont `treaty(app)` en-process) |
| `bun run typecheck`                                                       | `bun check .` + `svelte-check`                   |
| `bun run fmt` / `fmt:check`                                               | formatage Bun                                    |

## Auth (prévu, non implémenté)

Better Auth sera monté côté API via `app.mount('/api/auth', auth.handler)` avec `@better-auth/prisma-adapter`. Ne pas utiliser le add-on `sv better-auth` (Drizzle). Le client Eden transmet déjà les cookies en SSR.

## Outils agentiques

- `AGENTS.md` : conventions et commandes.
- MCP Svelte + skills + sous-agent `svelte-file-editor` via le plugin OpenCode `@sveltejs/opencode` (config dans `apps/web/.opencode/`), plus le skill optionnel `svelte-mcp-feedback`.
- MCP Prisma et MCP Vite/Svelte DevTools configurés dans `opencode.json` (connexion via `/mcps`).
- Les **11 skills Prisma** installés dans `.agents/skills/` via `bunx skills add prisma/skills -y` (CLI, Client API, database setup, upgrades, Postgres, Compute, etc.).
- Les **skills Svelte officiels** (`svelte-code-writer`, `svelte-core-bestpractices`, `svelte-mcp-feedback`) installés via `bunx skills add sveltejs/ai-tools ... -y`, en plus de ceux fournis par le plugin `@sveltejs/opencode`.
- `/llms.txt` de l'API généré depuis OpenAPI.
