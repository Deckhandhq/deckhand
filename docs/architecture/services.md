# Services

[Documentation index](../README.md) - [Architecture overview](overview.md) - [API](../guides/api.md)

## API modules

The API is a modular monolith. Each module is a named Elysia instance with a prefix and explicit dependencies:

```ts
new Elysia({ name: "health", prefix: "/health" });
```

Rules that keep the type inference intact:

- Declare dependencies with `.use()` instead of relying on global state.
- Chain methods; chaining is required for Eden type inference.
- Validate with Prismabox or TypeBox schemas, never with TypeScript types alone.
- Lifecycles are scoped by default. Use `.as('scoped')` only for authentication.

The root app in `apps/api/src/app.ts` composes the error plugin, OpenAPI, `llms.txt`, and the health module. The server entry point `src/index.ts` calls `app.listen(env.port)` and logs the address. Keeping those two files apart is what lets tests and the frontend import the app without starting a listener.

## Error handling

`apps/api/src/plugins/errors.ts` installs one `onError` hook.

| Code          | Status | Response                                                    |
| ------------- | ------ | ----------------------------------------------------------- |
| `VALIDATION`  | 422    | `{ error: "Validation failed", details: error.message }`    |
| `NOT_FOUND`   | 404    | `{ error: "Not found" }`                                    |
| anything else | 500    | `{ error: "Internal server error" }`, logged to the console |

## Database package

`@deckhand/database` exports three things from `src/index.ts`:

| Export           | Source                           | Use                                                       |
| ---------------- | -------------------------------- | --------------------------------------------------------- |
| `prisma`         | `src/client.ts`                  | Singleton client built with `PrismaPg` and `DATABASE_URL` |
| generated client | `src/generated/prisma`           | Model types and operations                                |
| `schemas`        | `src/generated/prismabox/barrel` | TypeBox validation models                                 |

The client is cached on `globalThis` outside production so repeated development imports do not open new pools. A missing `DATABASE_URL` throws at import time in application code, while Prisma CLI commands remain usable without it. See [Data model](data-model.md).

## Typed client

`apps/web/src/lib/api/client.ts` builds the Eden client. Its options are:

| Option    | Purpose                                                        |
| --------- | -------------------------------------------------------------- |
| `baseUrl` | API origin: public for the browser, internal during SSR        |
| `prefix`  | `/api` behind a reverse proxy, empty for direct internal calls |
| `fetch`   | SvelteKit's `event.fetch`, so cookies are preserved            |
| `cookie`  | Forwarded request cookie during server rendering               |

The client uses `credentials: "include"` and a fetcher that rewrites the path with the prefix. During SSR the web server calls `http://api:3000` directly; the browser goes through the same-origin `/api` path. See [Type flow](type-flow.md).

## Web proxy route

`apps/web/src/routes/api/[...path]/+server.ts` is a SvelteKit fallback that forwards `/api/*` to `API_INTERNAL_URL`, defaulting to `http://api:3000`. It removes the incoming `Host` header because that host belongs to the web server, not the API. With Caddy routing `/api/*` straight to the API, this route is unused; it exists for deployments without an external proxy that strips the prefix.
