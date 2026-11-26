# Roadmap

[Documentation index](../README.md) - [Product overview](overview.md)

The current priorities, in order. None of these items is implemented yet.

- [ ] **Better Auth on the API** with the Prisma adapter.
- [ ] **Forum module:** threads, posts and moderation.
- [ ] **Playwright and Storybook checks in CI.**
- [ ] **OpenTelemetry observability.**

## Planned authentication shape

Better Auth belongs on the API side, with `@better-auth/prisma-adapter`. The handler is mounted with `.mount('/api/auth', ...)`. The SvelteKit `sv better-auth` add-on must not be used, because it uses Drizzle; this project uses Prisma. See [Conventions](../reference/conventions.md).

## What the roadmap implies for the code

| Item | Area it touches |
|---|---|
| Better Auth | API module, Prisma schema, generated client, typed client paths |
| Forum module | New Elysia modules under `apps/api/src/modules`, Prismabox models, new routes |
| Playwright and Storybook in CI | Existing web test and Storybook configuration |
| OpenTelemetry | API lifecycle hooks and deployment configuration |

> **Note** - The health endpoint and the typed client are already in place, so the first two items can build on them. See [Services](../architecture/services.md) and [API](../guides/api.md).
