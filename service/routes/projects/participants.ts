import { Hono } from "hono";
import type { HonoOptions } from "service/types.ts";
import * as v from "valibot";
import { getParticipants } from "../../db/models/participants.ts";
import { param } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>().get(
  "/",
  param({ projectId: v.string() }),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const participants = await getParticipants(c, projectId);

    return c.json(participants);
  },
);
export default route;
