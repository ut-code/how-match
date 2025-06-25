import { Hono } from "hono";
import type { HonoOptions } from "service/types";
import { json, param } from "service/validator/hono.ts";
import { InsertPreference, Ratings } from "share/schema.ts";
import * as v from "valibot";
import { insertParticipant } from "../../db/models/participants.ts";
import {
  deletePreviousRatings,
  getPreviousRatings,
  insertBulkRatings,
} from "../../db/models/ratings.ts";

const route = new Hono<HonoOptions>()
  .put(
    "/",
    json(
      v.object({
        preference: InsertPreference,
        ratings: Ratings,
      }),
    ),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");

      await deletePreviousRatings(c, projectId);

      const participant = await insertParticipant(
        c,
        projectId,
        body.preference,
      );

      await insertBulkRatings(c, projectId, participant.id, body.ratings);

      return c.json({ ok: true }, 201);
    },
  )
  .get("/", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const ratings = await getPreviousRatings(c, projectId);
    return c.json(ratings);
  });

export default route;
