# Deckhand

A forum you can host yourself, typed from database to browser, built entirely with Bun.

[![CI](https://github.com/Deckhandhq/deckhand/actions/workflows/ci.yml/badge.svg)](https://github.com/Deckhandhq/deckhand/actions/workflows/ci.yml)
[![Docker](https://github.com/Deckhandhq/deckhand/actions/workflows/docker.yml/badge.svg)](https://github.com/Deckhandhq/deckhand/actions/workflows/docker.yml)

Deckhand pairs a modular Elysia and Prisma API with a SvelteKit frontend. It is published as multi-arch Docker images, so running it on a VPS only requires Docker: download one stack file, set a few values, and start the containers.

## At a glance

| | |
|---|---|
| Product | Self-hosted discussion forum |
| Runtime and tooling | Bun 1.4: package manager, tests, type checker, formatter, bundler |
| API | Elysia 1.4 with Prismabox validation, OpenAPI and `llms.txt` |
| Database | PostgreSQL 17 with Prisma 7 and the `pg` driver adapter |
| Frontend | SvelteKit 3, Svelte 5, `@sveltejs/adapter-bun` |
| Hosting | Docker Compose, with optional Caddy for automatic TLS |
| Maturity | Foundation in place: health check, typed client, minimal schema. Authentication and forum modules are planned. |

## System context

```mermaid
flowchart LR
    U[Browser] -->|HTTPS| C[Caddy]
    C -->|"/api/*"| A[API - Elysia]
    C -->|"/*"| W[Web - SvelteKit]
    A --> P[(PostgreSQL)]
    W -.->|"SSR - API_INTERNAL_URL"| A
```

The browser always calls the API on the same origin, so there is no CORS setup. Caddy is optional: without it, the web service proxies `/api` itself. During server-side rendering, the web server reaches the API directly over the Docker network. See [Architecture overview](docs/architecture/overview.md).

## Documentation

This README is the entry point. All detail lives in a self-contained documentation set under [`docs/`](docs/README.md).

| Area | Document | Covers |
|---|---|---|
| Product | [Overview](docs/product/overview.md) | Positioning, highlights, current scope |
| Product | [Roadmap](docs/product/roadmap.md) | Planned auth, forum and tooling work |
| Architecture | [Overview](docs/architecture/overview.md) | Stack, request paths, services |
| Architecture | [Type flow](docs/architecture/type-flow.md) | Prisma schema through Prismabox to Eden |
| Architecture | [Services](docs/architecture/services.md) | API modules, errors, database package, typed client |
| Architecture | [Data model](docs/architecture/data-model.md) | Schema, generators, migrations, seed |
| Guides | [Getting started](docs/guides/getting-started.md) | Local development and commands |
| Guides | [API](docs/guides/api.md) | Endpoints, error format, typed client |
| Operations | [Deployment](docs/operations/deployment.md) | VPS checklist and hardening |
| Operations | [Backups](docs/operations/backups.md) | Backup, restore, update scripts |
| Operations | [Monitoring](docs/operations/monitoring.md) | Health probe, logs, troubleshooting |
| Reference | [Conventions](docs/reference/conventions.md) | Rules for API, Elysia, Prisma and the typed client |
| Reference | [Repository layout](docs/reference/repository-layout.md) | Annotated source tree |

## Run it

Download the stack file, edit the database password and public URL, then start it:

```bash
curl -fsSLO https://github.com/Deckhandhq/deckhand/releases/latest/download/docker-compose.yml
$EDITOR docker-compose.yml
docker compose up -d
```

Caddy is optional. Enable the recommended HTTPS reverse proxy with `docker compose --profile proxy up -d`. Without it, point your own HAProxy or Nginx at `127.0.0.1:3000`; the app proxies `/api` itself. Full prerequisites and hardening are in [Deployment](docs/operations/deployment.md).

## Develop

```bash
bun install
bun run dev
```

`bun run dev` regenerates the Prisma client and runs both services in parallel. See [Getting started](docs/guides/getting-started.md) for prerequisites, workspace filters and the command reference.

In-depth guides also exist on the [documentation site](https://deckhandhq.github.io/deckhand-docs/). Agent instructions live in [`AGENTS.md`](AGENTS.md); the developer-facing rules are collected in [Conventions](docs/reference/conventions.md).
