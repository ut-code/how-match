import { Hono } from "hono";
import { createAuth, getCurrentUser } from "../features/auth/index.ts";
import type { HonoOptions } from "../types.ts";

const auth = new Hono<HonoOptions>()
  .get("/me", async (c) => {
    const user = await getCurrentUser(c);
    if (!user) {
      return c.json({ user: null });
    }
    return c.json({ user });
  })
  .all("/*", async (c) => {
    const authInstance = createAuth(c);
    return await authInstance.handler(c.req.raw);
  });

export default auth;
