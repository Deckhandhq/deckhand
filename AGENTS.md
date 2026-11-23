# Deckhand — Agent Instructions

A 100% Bun monorepo: Elysia + Prisma API, SvelteKit frontend, self-hosted PostgreSQL.

---

## Commands

Always run commands through Bun.

| Command                             | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `bun install`                       | Install all workspaces (lockfile: `bun.lock`)                      |
| `bun run dev`                       | Run API + web in parallel (`predev` regenerates the Prisma client) |
| `bun run build` / `bun run start`   | Build / start the project                                          |
| `bun run db:generate`               | Generate the Prisma client                                         |
| `bun run db:migrate`                | Create and apply a migration                                       |
| `bun run db:deploy`                 | Apply pending migrations                                           |
| `bun run db:seed`                   | Seed the database                                                  |
| `bun run studio`                    | Open Prisma Studio                                                 |
| `bun test`                          | Run the test suite                                                 |
| `bun run typecheck`                 | Run TypeScript checks                                              |
| `bun run fmt` / `bun run fmt:check` | Format code / check formatting                                     |

To target a single service, use the workspace filter:

```sh
bun run --filter @deckhand/api <command>
bun run --filter @deckhand/web <command>
```

---

## Architecture Rules

### Services

- Two services: `@deckhand/api` (port `3000`) and `@deckhand/web` (port `5173`).
- The web app calls the API through `/api` (Vite proxy in dev, reverse proxy in prod).
- This is same-origin — no browser-side CORS handling needed.

### Typed client

- `@deckhand/api` exports `type App` from `src/app.ts` — **never** from `index.ts`, which calls `.listen()`.
- The web app uses `treaty<App>` from `@elysia/eden`, with `fetcher`/`headers` provided by SvelteKit.
- Elysia versions are kept in sync via the catalog.

### Elysia

- One module = `new Elysia({ name, prefix })` with explicit `.use()` dependencies.
- Lifecycle is scoped by default; use `.as('scoped')` only for auth.
- Validate with Prismabox/TypeBox schemas — never with types alone.
- Always chain methods (required for Eden type inference).

### Prisma 7

- Schema lives in `packages/database/prisma`.
- Generators: `prisma-client` + `prismabox`.
- Driver adapter: `@prisma/adapter-pg`.
- `DATABASE_URL` is configured in `prisma.config.ts`.
- Run CLI commands with `bunx --bun prisma ...`.

### Auth (planned)

- Better Auth on the API side, with `@better-auth/prisma-adapter`.
- Mount `auth.handler` via `.mount('/api/auth', ...)`.
- Do **not** use the `sv better-auth` add-on (it uses Drizzle).

### Clean project

- No starter code, no demo code.
- New modules = empty folders containing only what is necessary.

---

## Documentation

Prefer `.md` pages and `llms.txt` variants over HTML pages.

| Topic              | Resource                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Bun                | https://bun.com/llms.txt                                                                                                    |
| Elysia             | https://elysiajs.com/llms.txt (`.md` pages, e.g. `https://elysiajs.com/eden/treaty/config.md`)                              |
| Prisma v7          | https://www.prisma.io/docs/llms/orm-v7.txt (`.md` pages; always check https://www.prisma.io/changelog.md)                   |
| Svelte / SvelteKit | `svelte` MCP via `@sveltejs/opencode` (https://svelte.dev/docs/ai/overview), otherwise https://svelte.dev/docs/kit/llms.txt |

---

## Available Agent Tooling

### MCP & plugins

- **Svelte MCP** (docs + `svelte-autofixer`), skills, and the `svelte-file-editor` subagent via the `@sveltejs/opencode` OpenCode plugin (config: `apps/web/.opencode/svelte.json`, skills enabled by default).
- Optional `svelte-mcp-feedback` skill in `apps/web/.opencode/skills/`.
- **Prisma MCP** configured in `opencode.json` (`https://mcp.prisma.io/mcp`) — connect via `/mcps`.
- **Vite/Svelte DevTools MCP** configured locally (`bunx @sveltejs/vite-devtools-svelte mcp`), provided by the `devtools` add-on.

### Skills in `.agents/skills/`

- **11 Prisma skills** (installed with `bunx skills add prisma/skills -y`): `prisma-cli`, `prisma-client-api`, `prisma-compute`, `prisma-database-setup`, `prisma-driver-adapter-implementation`, `prisma-mongodb-upgrade`, `prisma-orm-setup`, `prisma-postgres`, `prisma-postgres-setup`, `prisma-postgres-upgrade`, `prisma-upgrade-v7`.
- **Official Svelte skills** (installed with `bunx skills add sveltejs/ai-tools --skill ... -y`): `svelte-code-writer`, `svelte-core-bestpractices`, `svelte-mcp-feedback`. Also provided and kept up to date by the `@sveltejs/opencode` plugin, along with the `svelte-file-editor` subagent.

### API

- The API exposes `/openapi` (Scalar) and `/llms.txt` generated from OpenAPI for agents.
