# Deckhand — instructions pour agents

Monorepo 100 % Bun : API Elysia + Prisma, front SvelteKit, PostgreSQL self-hosté.

## Commandes (toujours via Bun)

- `bun install` — installer tous les workspaces (lockfile : `bun.lock`)
- `bun run dev` — API + web en parallèle (`predev` régénère le client Prisma)
- `bun run build`, `bun run start`
- `bun run db:generate`, `db:migrate`, `db:deploy`, `db:seed`, `studio`
- `bun test`, `bun run typecheck`, `bun run fmt` / `fmt:check`
- `bun run --filter @deckhand/api ...`, `bun run --filter @deckhand/web ...`

## Règles d'architecture

- **2 services** : `@deckhand/api` (port 3000) et `@deckhand/web` (port 5173). Le web appelle l'API via `/api` (proxy Vite en dev, reverse proxy en prod) : same-origin, pas de CORS à gérer côté navigateur.
- **Client typé** : `@deckhand/api` exporte `type App` depuis `src/app.ts` (jamais depuis `index.ts`, qui appelle `.listen()`). Le web utilise `treaty<App>` depuis `@elysia/eden` avec `fetcher`/`headers` fournis par SvelteKit. Versions d'Elysia alignées par le catalog.
- **Elysia** : un module = `new Elysia({ name, prefix })` avec dépendances explicites `.use()`. Lifecycle isolé par défaut ; `.as('scoped')` uniquement pour l'auth. Validation via schémas Prismabox/TypeBox, jamais de types seuls. Toujours chaîner les méthodes (nécessaire pour l'inférence Eden).
- **Prisma 7** : schéma dans `packages/database/prisma`, générateurs `prisma-client` + `prismabox`, driver adapter `@prisma/adapter-pg`, `DATABASE_URL` configuré dans `prisma.config.ts`. Utiliser `bunx --bun prisma ...`.
- **Auth (plus tard)** : Better Auth côté API avec `@better-auth/prisma-adapter` et `auth.handler` monté via `.mount('/api/auth', ...)`. Ne pas utiliser le add-on `sv better-auth` (Drizzle).
- **Projet clean** : pas de starter, pas de code de démo. Nouveaux modules = dossiers vides avec uniquement le nécessaire.

## Documentation à consulter (préférer les variantes `.md` / llms.txt)

- Bun : https://bun.com/llms.txt
- Elysia : https://elysiajs.com/llms.txt (pages `.md`, ex. `https://elysiajs.com/eden/treaty/config.md`)
- Prisma v7 : https://www.prisma.io/docs/llms/orm-v7.txt (pages `.md`, toujours vérifier https://www.prisma.io/changelog.md)
- Svelte / SvelteKit : MCP `svelte` configuré via `@sveltejs/opencode` (https://svelte.dev/docs/ai/overview), sinon https://svelte.dev/docs/kit/llms.txt

## Outils agentiques disponibles

- MCP Svelte (docs + `svelte-autofixer`), skills et sous-agent `svelte-file-editor` via le plugin OpenCode `@sveltejs/opencode` (config `apps/web/.opencode/svelte.json`, skills activés par défaut).
- Skill optionnel `svelte-mcp-feedback` installé dans `apps/web/.opencode/skills/`.
- MCP Prisma configuré dans `opencode.json` (`https://mcp.prisma.io/mcp`) : se connecter via `/mcps`.
- MCP Vite/Svelte DevTools configuré en local (`bunx @sveltejs/vite-devtools-svelte mcp`), proposé par le add-on `devtools`.
- Les **11 skills Prisma** du registre sont installés dans `.agents/skills/` (`bunx skills add prisma/skills -y`) : `prisma-cli`, `prisma-client-api`, `prisma-compute`, `prisma-database-setup`, `prisma-driver-adapter-implementation`, `prisma-mongodb-upgrade`, `prisma-orm-setup`, `prisma-postgres`, `prisma-postgres-setup`, `prisma-postgres-upgrade`, `prisma-upgrade-v7`.
- Les **skills Svelte officiels** sont également présents dans `.agents/skills/` (`bunx skills add sveltejs/ai-tools --skill ... -y`) : `svelte-code-writer`, `svelte-core-bestpractices`, `svelte-mcp-feedback`. Le plugin `@sveltejs/opencode` les fournit aussi et les maintient à jour, avec le sous-agent `svelte-file-editor`.
- L'API expose `/openapi` (Scalar) et `/llms.txt` généré depuis OpenAPI pour les agents.
