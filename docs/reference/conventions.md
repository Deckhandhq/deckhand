# Conventions

[Documentation index](../README.md) - [Repository layout](repository-layout.md)

Rules that are easy to violate with a locally plausible edit. The canonical instruction file for coding agents is [`AGENTS.md`](../../AGENTS.md); this page is the developer-facing version of the same rules.

## Services

- Two services: `@deckhand/api` on port 3000 and `@deckhand/web` on port 5173 in development.
- The web app calls the API through `/api`: a Vite proxy in development, a reverse proxy in production. This is same-origin, so no browser-side CORS handling is needed.
- Use workspace filters to run a command in one service only. See [Getting started](../guides/getting-started.md).

## Typed client

- `@deckhand/api` exports `type App` from `src/app.ts`, never from `index.ts`, which calls `.listen()`.
- The web app uses `treaty<App>` from `@elysia/eden`, with `fetch` and `headers` supplied by SvelteKit.
- Elysia versions are kept in sync through the catalog in the root `package.json`. See [Type flow](../architecture/type-flow.md).

## Elysia

- One module is one `new Elysia({ name, prefix })` with explicit `.use()` dependencies.
- Lifecycles are scoped by default. Use `.as('scoped')` only for authentication.
- Validate with Prismabox or TypeBox schemas, never with types alone.
- Always chain methods; chaining is required for Eden type inference. See [Services](../architecture/services.md).

## Prisma 7

- The schema lives in `packages/database/prisma`.
- Generators are `prisma-client` and `prismabox`.
- The driver adapter is `@prisma/adapter-pg`.
- `DATABASE_URL` is configured in `prisma.config.ts`.
- Run CLI commands with `bunx --bun prisma ...`, usually through the root scripts. See [Data model](../architecture/data-model.md).

## Authentication, when implemented

- Better Auth belongs on the API side, with `@better-auth/prisma-adapter`.
- Mount its handler with `.mount('/api/auth', ...)`.
- Do not use the `sv better-auth` add-on, because it uses Drizzle. See the [Roadmap](../product/roadmap.md).

## Clean project

- No starter code and no demo code.
- New modules are empty folders containing only what is necessary.

## Agent tooling

The repository ships Prisma and Svelte skills under `.agents/skills/`, plus MCP configuration for Prisma, Svelte and Vite devtools. The canonical list, including documentation sources, is in [`AGENTS.md`](../../AGENTS.md). The API itself exposes `/llms.txt` for agents; see [API](../guides/api.md).
