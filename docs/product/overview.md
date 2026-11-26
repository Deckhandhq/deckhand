# Product overview

[Documentation index](../README.md) - [Roadmap](roadmap.md)

Deckhand is a forum you can host yourself. It is built around a simple promise: the types flow from the database schema to the browser, so a field change is reflected in validation and in the frontend client without hand-written duplication.

## Positioning

| Axis | Choice |
|---|---|
| Ownership | Runs on your own infrastructure; a single Docker Compose stack is the supported deployment |
| Typing | Eden Treaty infers the API from `type App`; no client code generation |
| Validation | Prismabox derives TypeBox models from the Prisma schema, reused by Elysia and OpenAPI |
| Runtime | Bun everywhere: package manager, tests, type checker, formatter, bundler, and server |
| Delivery | Multi-arch Docker images with pinned release tags |

## Highlights

- **Forum first.** The goal is a discussion board you can run on your own infrastructure, not a general-purpose starter.
- **Modular monolith.** Elysia plugins declare explicit dependencies and isolate their lifecycles.
- **End-to-end types.** The API exports a type, and the frontend infers its client from it.
- **Schema-driven validation.** Validation comes from the schema, not from TypeScript types alone.
- **Self-hosting first.** Health checks, backup scripts, pinned releases and a single `docker compose up -d`.

## What exists today

The repository is at the foundation stage. It contains:

- an API with a health endpoint, a uniform error handler, OpenAPI documentation and an `llms.txt` endpoint;
- a SvelteKit frontend that resolves API health during server rendering and displays it;
- a typed Eden client configured for both the browser and SSR;
- a PostgreSQL database with a minimal `User` model, a migration and a seed entry point;
- a deployable Docker Compose stack with an optional Caddy reverse proxy and backup scripts.

> **Note** - There is no demo or starter content by design. New modules are empty folders containing only what they need; see [Conventions](../reference/conventions.md).

## What is not there yet

Authentication with Better Auth, forum threads and posts, moderation, Playwright and Storybook checks in CI, and observability. See the [Roadmap](roadmap.md).

## Further reading

The project also publishes a [documentation site](https://deckhandhq.github.io/deckhand-docs/) for in-depth guides. This documentation set is complete on its own for development and operation.
