import { openapi } from "@elysia/openapi";
import { llms } from "@opuu/elysia-llms-txt";
import { Elysia } from "elysia";

import { health } from "./modules/health";
import { errors } from "./plugins/errors";

/**
 * Application sans `listen` : réutilisable par le serveur, les tests
 * (`treaty(app)`) et le typage du front (`type App`).
 */
export const app = new Elysia()
  .use(errors)
  .use(
    openapi({
      documentation: {
        info: {
          title: "Deckhand API",
          version: "0.1.0",
          description: "API du monorepo Deckhand.",
        },
      },
    }),
  )
  .use(
    llms({
      source: { type: "url", url: "/openapi/json" },
      header: "# Deckhand API\n\nDocumentation générée depuis OpenAPI.",
      cache: { enabled: true },
    }),
  )
  .use(health);

export type App = typeof app;
