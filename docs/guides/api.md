# API

[Documentation index](../README.md) - [Getting started](getting-started.md) - [Services](../architecture/services.md)

## Endpoints

| Endpoint        | Purpose                                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| `GET /health`   | Health check returning `{ "status": "ok" }`                                       |
| `/openapi`      | Scalar UI generated from the OpenAPI document                                     |
| `/openapi/json` | The OpenAPI document itself                                                       |
| `/llms.txt`     | Agent-oriented documentation generated from `/openapi/json`, with caching enabled |

Authentication will be mounted at `/api/auth` when Better Auth is implemented; see the [Roadmap](../product/roadmap.md).

The health route is an Elysia module with the prefix `/health` and a TypeBox response model:

```ts
export const health = new Elysia({ name: "health", prefix: "/health" }).get(
  "/",
  () => ({ status: "ok" }) as const,
  {
    response: t.Object({ status: t.Literal("ok") }),
    detail: { tags: ["System"], summary: "Health check" },
  },
);
```

## Error format

The shared error plugin returns a consistent shape.

| Condition          | Status | Body                                                 |
| ------------------ | ------ | ---------------------------------------------------- |
| Validation failure | 422    | `{ "error": "Validation failed", "details": "..." }` |
| Unknown route      | 404    | `{ "error": "Not found" }`                           |
| Unexpected error   | 500    | `{ "error": "Internal server error" }`               |

Unexpected errors are logged server-side; clients never receive the raw message.

## Typed calls

The frontend does not hand-write request URLs or response types. It creates an Eden client from `type App`:

```ts
import type { App } from "@deckhand/api/app";
import { treaty } from "@elysia/eden";

const api = treaty<App>("http://localhost:3000");
const { data, error } = await api.health.get();
```

In the application, `createApiClient` from `apps/web/src/lib/api/client.ts` is the wrapper to use. It sets the prefix for the reverse proxy, forwards cookies during SSR, and accepts SvelteKit's `fetch`. See [Services](../architecture/services.md).

> **Warning** - Import the app type from `@deckhand/api/app`. The package root calls `.listen()` and must stay server-only.

## Same-origin behavior

The browser calls `/api/*` on the same origin, so there is no CORS handling in the client. With the Caddy profile, `/api/*` goes straight to the API. Without Caddy, the web service forwards it. During SSR the web server calls the API directly through `API_INTERNAL_URL`. See [Architecture overview](../architecture/overview.md).
