import { Hono } from "hono";
import type { HonoOptions } from "../types.ts";
import * as v from "valibot";
import { accounts } from "../../db/schema.ts";
import { db } from "../../db/client.ts";
import { json } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>()
  .post(
    "/",
    json(
      v.object({
        name: v.pipe(v.string(), v.minLength(3)),
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
