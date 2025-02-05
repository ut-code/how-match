import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { cors } from "hono/cors";
import { user } from "../db/schema.ts";
import { db } from "../db/client.ts";
import { env } from "utils/env.ts";

export const app = new Hono()
  .use(cors({
    origin: env("CORS_ALLOW_ORIGINS").split(","),
  }))
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
    return c.json(await db.select().from(user).execute());
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
      const resp = await db.insert(user).values([body]).returning().execute();
      console.log("added", resp[0]);
      return c.json(resp[0]);
    },
  );

console.log("running");
