import { Hono } from "hono";
import * as v from "valibot";
import { param } from "../../validator/hono.ts";
import { db } from "../../db/client.ts";
import { participants, ratings } from "../../db/schema.ts";
import { and, eq, exists, or } from "drizzle-orm";
import type { HonoOptions } from "../../types.ts";

const route = new Hono<HonoOptions>().get(
  "/",
  param({ projectId: v.string() }),
  async (c) => {
    const { projectId } = c.req.valid("param");
    const d = db(c);
    const participant_list = await d
      .select({
        id: participants.id,
        name: participants.name,
        is_admin: participants.is_admin,
        roles_count: participants.roles_count,
      })
      .from(participants)
      .where(
        and(
          eq(participants.project_id, projectId),
          or(
            eq(participants.is_admin, 0), // PERF: skip ratings check if !participants.is_admin, because it will always exist
            exists(
              d
                .select({ id: ratings.id })
                .from(ratings)
                .where(eq(ratings.participant_id, participants.id)),
            ),
          ),
        ),
      );
    return c.json(participant_list);
  },
);
export default route;
