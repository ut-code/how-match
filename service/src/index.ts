import type { HonoOptions } from "./types.ts";
import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { account, match, participant, rating, role } from "../db/schema.ts";
import { db } from "../db/client.ts";
import { env } from "../utils/env.ts";
import { z } from "zod";

const corsOptions = (c: Context) => ({
  origin: env(c, "CORS_ALLOW_ORIGINS").split(","),
});

const app = new Hono<HonoOptions>()
  .basePath("/api")
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
  .get("/accounts", async (c) => {
    return c.json(await db(c).select().from(account).execute());
  })
  // .get("/participants", async (c) => {
  //   return c.json(await db(c).select().from(participant).execute());
  // })
  .post(
    "/participants",
    zValidator(
      "json",
      z.object({
        account_id: z.coerce.number(),
        project_id: z.coerce.number(),
        is_admin: z.coerce.boolean(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const resp = await db(c).insert(participant).values([
        {
          id: 0, // uuid あとで
          account_id: body.account_id,
          project_id: body.project_id,
          is_admin: Number(body.is_admin),
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  )
  .post(
    "/accounts",
    zValidator(
      "json",
      z.object({
        name: z.string(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const resp = await db(c).insert(account).values([
        {
          id: 0, // uuid あとで
          name: body.name,
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  )
  .post(
    "/role",
    zValidator(
      "json",
      z.object({
        min: z.coerce.number(),
        max: z.coerce.number(),
        project_id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const resp = await db(c).insert(role).values([
        {
          id: 0, // uuid あとで
          min: body.min,
          max: body.max,
          project_id: body.project_id,
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  )
  .post(
    "/rating",
    zValidator(
      "json",
      z.object({
        participant_id: z.coerce.number(),
        role_id: z.coerce.number(),
        score: z.coerce.number(),
        project_id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const resp = await db(c).insert(rating).values([
        {
          id: 0, // uuid あとで
          participant_id: body.participant_id,
          role_id: body.role_id,
          score: body.score,
          project_id: body.project_id,
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  )
  .post(
    "/match",
    zValidator(
      "json",
      z.object({
        role_id: z.coerce.number(),
        participant_id: z.coerce.number(),
        project_id: z.coerce.number(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const resp = await db(c).insert(match).values([
        {
          id: 0, // uuid あとで
          role_id: body.role_id,
          participant_id: body.participant_id,
          project_id: body.project_id,
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
