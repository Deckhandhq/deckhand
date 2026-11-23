import { Elysia, t } from "elysia";

export const health = new Elysia({ name: "health", prefix: "/health" }).get(
  "/",
  () => ({ status: "ok" }) as const,
  {
    response: t.Object({ status: t.Literal("ok") }),
    detail: { tags: ["System"], summary: "Health check" },
  },
);
