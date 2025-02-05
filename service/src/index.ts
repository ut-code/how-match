import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { participant } from "../db/schema.ts";
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
  .get("/participants", async (c) => {
    return c.json(await db.select().from(participant).execute());
  })
  .post(
    "/participants",
    zValidator(
      "form",
      z.object({
        account_id: z.coerce.number(),
        project_id: z.coerce.number(),
        is_admin: z.coerce.boolean(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("form");
      const resp = await db.insert(participant).values([
        {
          participant_id: Number(crypto.randomUUID()),
          account_id: body.account_id,
          project_id: body.project_id,
          is_admin: Number(body.is_admin),
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  );

console.log("running");

// biome-ignore lint/style/noDefaultExport:
export default app;
export type App = typeof app;
