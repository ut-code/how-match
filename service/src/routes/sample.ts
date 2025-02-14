import { zValidator } from "@hono/zod-validator";
import { db } from "db/client";
import { account } from "db/schema";
import { Hono } from "hono";
import type { HonoOptions } from "src/types";
import { z } from "zod";

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
