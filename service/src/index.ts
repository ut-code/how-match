import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { z } from "zod";
import { cors } from "hono/cors";
import { user } from "../db/schema.ts";
import { db } from "../db/client.ts";
import { env } from "../utils/env.ts";

const corsOptions = (c: Context) => ({
  origin: env(c, "CORS_ALLOW_ORIGINS").split(","),
});

const app = new Hono()
  .use(async (c, next) => {
    await cors(corsOptions(c))(
      c,
      next,
    );
  })
  .get("/", (c) => c.text("Hello from Hono!"))
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
      }),
    ),
    (c) => {
      const name = c.req.valid("json").name;
      return c.text(`Hello ${name}!`);
    },
  )
  .get("/users", async (c) => {
    return c.json(await db(c).select().from(user).execute());
  })
  .post(
    "/users",
    zValidator(
      "form",
      z.object({
        name: z.string(),
        age: z.coerce.number(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("form");
      const resp = await db(c).insert(user).values([body]).returning()
        .execute();
      console.log("added", resp[0]);
      return c.json(resp[0]);
    },
  );

console.log("running");

// biome-ignore lint/style/noDefaultExport:
export default app;
export type App = typeof app;
