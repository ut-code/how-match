import { and, eq, exists, or } from "drizzle-orm";
import { Hono } from "hono";
import * as v from "valibot";
import { db } from "../../db/client.ts";
import { Participants, Ratings } from "../../db/schema.ts";
import type { HonoOptions } from "service/types.ts";
import { param } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>().get(
  "/",
  param({ projectId: v.string() }),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const d = db(c);
    const participants = await d
      .select({
        id: Participants.id,
        name: Participants.name,
        isAdmin: Participants.isAdmin,
        rolesCount: Participants.rolesCount,
      })
      .from(Participants)
      .where(
        and(
          eq(Participants.projectId, projectId),
          or(
            eq(Participants.isAdmin, 0), // PERF: skip ratings check if !participants.isAdmin, because it will always exist
            exists(
              d
                .select({ id: Ratings.id })
                .from(Ratings)
                .where(eq(Ratings.participantId, Participants.id)),
            ),
          ),
        ),
      );
    return c.json(participants);
  },
);
export default route;
