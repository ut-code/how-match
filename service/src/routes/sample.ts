import { zValidator } from "@hono/zod-validator";
import { accounts } from "../../db/schema.ts";
import { Hono } from "hono";
import type { HonoOptions } from "../types.ts";
import { z } from "zod";
import { db } from "../../db/client.ts";

const route = new Hono<HonoOptions>()
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
      const resp = await db(c).insert(accounts).values([
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
    const resp = await db(c).select().from(accounts);
    return c.json(resp);
  });
export default route;
