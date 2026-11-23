import { openapi } from "@elysia/openapi";
import { llms } from "@opuu/elysia-llms-txt";
import { Elysia } from "elysia";

import { health } from "./modules/health";
import { errors } from "./plugins/errors";

/**
 * App without `listen`: reusable by the server, tests
 * (`treaty(app)`) and frontend typing (`type App`).
 */
export const app = new Elysia()
  .use(errors)
  .use(
    openapi({
      documentation: {
        info: {
          title: "Deckhand API",
          version: "0.1.0",
          description: "Deckhand monorepo API.",
        },
      },
    }),
  )
  .use(
    llms({
      source: { type: "url", url: "/openapi/json" },
      header: "# Deckhand API\n\nDocumentation generated from OpenAPI.",
      cache: { enabled: true },
    }),
  )
  .use(health);

export type App = typeof app;
