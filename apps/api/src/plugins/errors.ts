import { Elysia } from "elysia";

export const errors = new Elysia({ name: "deckhand-errors" }).onError(
  ({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 422;
      return { error: "Validation failed", details: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    console.error(error);
    set.status = 500;
    return { error: "Internal server error" };
  },
);
