# Getting started

[Documentation index](../README.md) - [API](api.md) - [Repository layout](../reference/repository-layout.md)

## Prerequisites

- Bun 1.4. It is the only runtime and toolchain in this repository: package manager, tests, type checker, formatter, bundler and server.
- PostgreSQL, reachable through `DATABASE_URL`. The published stack supplies its own container; local development needs a database you control.
- A CPU with AVX2 for Bun when deploying on a VPS; see [Deployment](../operations/deployment.md).

## Setup

```bash
bun install
cp .env.example .env
```

Development environment variables:

| Variable       | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string, including the schema |
| `NODE_ENV`     | `development` by default                           |
| `PORT`         | API port, 3000 by default                          |
| `CORS_ORIGIN`  | Frontend origin for development                    |

Production configuration lives in `docker-compose.yml`, not in `.env`. See [Deployment](../operations/deployment.md).

Apply migrations and start both services:

```bash
bun run db:migrate
bun run dev
```

`bun run dev` first regenerates the Prisma client, then runs the API and the web app in parallel. The API listens on port 3000, the web app on 5173, and Vite proxies `/api` to the API. No browser-side CORS setup is needed.

## Commands

Always run commands through Bun.

| Command                             | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| `bun install`                       | Install all workspaces from `bun.lock`                           |
| `bun run dev`                       | Run API and web in parallel; regenerates the Prisma client first |
| `bun run build` / `bun run start`   | Build / start the project                                        |
| `bun run db:generate`               | Generate the Prisma client and Prismabox models                  |
| `bun run db:migrate`                | Create and apply a migration                                     |
| `bun run db:deploy`                 | Apply pending migrations                                         |
| `bun run db:seed`                   | Seed the database with reference data                            |
| `bun run studio`                    | Open Prisma Studio                                               |
| `bun test`                          | Run the test suite                                               |
| `bun run typecheck`                 | Type-check Bun code and SvelteKit code                           |
| `bun run fmt` / `bun run fmt:check` | Format code / check formatting                                   |

Target a single workspace with a filter:

```bash
bun run --filter @deckhand/api <command>
bun run --filter @deckhand/web <command>
```

## Tests

The API test uses Eden Treaty against the app instance directly, without opening a listener. The web app has Vitest projects for client and server code, plus Playwright and Storybook configuration; CI currently runs Bun tests and type checks, with Playwright and Storybook checks on the roadmap. See [Roadmap](../product/roadmap.md).

## Next steps

- [Type flow](../architecture/type-flow.md) before changing the schema.
- [Conventions](../reference/conventions.md) before adding a module.
- [API](api.md) for the available endpoints and error format.
