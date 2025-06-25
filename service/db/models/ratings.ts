import { and, eq, exists } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types.ts";
import {
  type InsertRatings,
  type Ratings,
  SelectRatings,
} from "share/schema.ts";
import * as v from "valibot";
import { getBrowserID } from "../../features/auth/index.ts";
import { isAdmin } from "../../features/auth/rules.ts";
import { db } from "../client.ts";
import { Participants, Ratings as RatingsTable } from "../schema.ts";
import { getParticipantIdOrInsert } from "./participants.ts";

export async function getPreviousRatings(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<Ratings> {
  const browserId = await getBrowserID(c);

  const scores: v.InferInput<typeof SelectRatings> = await db(c)
    .select({
      roleId: RatingsTable.roleId,
      participantId: RatingsTable.participantId,
      score: RatingsTable.score,
    })
    .from(RatingsTable)
    .innerJoin(Participants, eq(RatingsTable.participantId, Participants.id))
    .where(
      and(
        eq(RatingsTable.projectId, projectId),
        eq(Participants.browserId, browserId),
      ),
    );

  return v.parse(SelectRatings, <v.InferInput<typeof SelectRatings>>scores);
}

export async function getAllRatings(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<Record<string, Ratings>> {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }

  const ratings = await db(c)
    .select({
      roleId: RatingsTable.roleId,
      participantId: RatingsTable.participantId,
      score: RatingsTable.score,
    })
    .from(RatingsTable)
    .where(eq(RatingsTable.projectId, projectId));

  const ratingsByParticipant = Map.groupBy(ratings, (r) => r.participantId)
    .entries()
    .map(
      ([participantId, ratings]) =>
        [
          participantId,
          v.parse(SelectRatings, <v.InferInput<typeof SelectRatings>>ratings),
        ] as const,
    );

  return Object.fromEntries(ratingsByParticipant);
}

export async function insertBulkRatings(
  c: Context<HonoOptions>,
  projectId: string,
  name: string,
  personalRatings: v.InferOutput<typeof InsertRatings>,
) {
  const participantId = await getParticipantIdOrInsert(c, name, projectId);

  await db(c)
    .insert(RatingsTable)
    .values(
      personalRatings.map((r) => ({
        id: crypto.randomUUID(),
        projectId,
        participantId,
        roleId: r.roleId,
        score: r.score,
      })),
    );
}

export async function deletePreviousRatings(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const browserId = await getBrowserID(c);

  await db(c)
    .delete(RatingsTable)
    .where(
      and(
        eq(RatingsTable.projectId, projectId),
        exists(
          db(c)
            .select({ id: Participants.id })
            .from(Participants)
            .where(
              and(
                eq(RatingsTable.participantId, Participants.id),
                eq(Participants.browserId, browserId),
                eq(Participants.projectId, projectId),
              ),
            ),
        ),
      ),
    );
}
