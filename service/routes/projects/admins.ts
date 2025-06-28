import { Hono } from "hono";
import type { HonoOptions } from "service/types.ts";
import * as v from "valibot";
import { getAdmins } from "../../db/models/admins.ts";
import { param } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>().get(
  "/",
  param({ projectId: v.string() }),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const admins = await getAdmins(c, projectId);

    return c.json(admins);
  },
);

export default route;
