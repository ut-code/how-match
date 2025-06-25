import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types";
import { json, param } from "service/validator/hono.ts";
import { InsertPreference, InsertRatings } from "share/schema.ts";
import * as v from "valibot";
import {
  deleteParticipant,
  getParticipantId,
  getParticipants,
  getPreviousSubmission,
  insertParticipant,
} from "../../db/models/participants.ts";
import {
  deletePreviousRatings,
  getAllRatings,
  getPreviousRatings,
  insertBulkRatings,
} from "../../db/models/ratings.ts";
import { isAdmin } from "../../features/auth/rules.ts";

const route = new Hono<HonoOptions>()
  .put(
    "/",
    json(
      v.object({
        preference: InsertPreference,
        ratings: InsertRatings,
      }),
    ),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");

      await deletePreviousRatings(c, projectId);

      const prevId = await getParticipantId(c, projectId);
      if (prevId) {
        await deleteParticipant(c, projectId, prevId);
      }

      const participant = await insertParticipant(
        c,
        projectId,
        body.preference,
      );

      await insertBulkRatings(c, projectId, participant.id, body.ratings);

      return c.json({ ok: true }, 201);
    },
  )
  .get("/mine", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const ratings = await getPreviousRatings(c, projectId);
    const submission = await getPreviousSubmission(c, projectId);
    return c.json({ ratings, submission });
  })

  .get("/all", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await isAdmin(c, projectId))) {
      throw new HTTPException(401, { message: "Forbidden" });
    }
    const ratings = await getAllRatings(c, projectId);
    const submissions = await getParticipants(c, projectId);
    return c.json({ ratings, submissions });
  });

export default route;
