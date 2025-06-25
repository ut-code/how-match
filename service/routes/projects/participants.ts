import { Hono } from "hono";
import type { HonoOptions } from "service/types.ts";
import * as v from "valibot";
import { getSubmittedParticipants } from "../../db/models/participants.ts";
import { param } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>().get(
  "/",
  param({ projectId: v.string() }),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const participants = await getSubmittedParticipants(c, projectId);
    return c.json(participants);
  },
);
export default route;
