import { treaty } from "@elysia/eden";
import { describe, expect, it } from "bun:test";

import { app } from "../src/app";

const api = treaty(app);

describe("health", () => {
  it("reports ok", async () => {
    const { data, error } = await api.health.get();

    expect(error).toBeNull();
    expect(data).toEqual({ status: "ok" });
  });
});
