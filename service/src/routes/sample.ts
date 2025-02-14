import { zValidator } from "@hono/zod-validator";
import { account } from "../../db/schema.ts";
import { Hono } from "hono";
import type { HonoOptions } from "../types.ts";
import { z } from "zod";
import { db } from "../../db/client.ts";

export const accounts = new Hono<HonoOptions>()
  .post(
    "/",
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
          id: Math.random().toString(), // uuid あとで
          name: body.name,
        },
      ]);
      console.log("added", resp);
      return c.json(resp);
    },
  )
  .get("/", async (c) => {
    const resp = await db(c).select().from(account).execute();
    return c.json(resp);
  });
