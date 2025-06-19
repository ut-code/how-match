import { and, eq, exists } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types.ts";
import { getBrowserID } from "../../features/auth/index.ts";
import { isAdmin } from "../../features/auth/rules.ts";
import { db } from "../client.ts";
import { Participants, Ratings } from "../schema.ts";
import {
  dehydrateRoleScore,
  hydrateRoleScore,
} from "../transformers/role-score.ts";
import { getParticipantIdOrInsert } from "./participants.ts";

export async function getPreviousRatings(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const browserId = await getBrowserID(c);

  const scores = await db(c)
    .select({
      roleId: Ratings.roleId,
      participantId: Ratings.participantId,
      score: Ratings.score,
    })
    .from(Ratings)
    .innerJoin(Participants, eq(Ratings.participantId, Participants.id))
    .where(
      and(
        eq(Ratings.projectId, projectId),
        eq(Participants.browserId, browserId),
      ),
    );

  return hydrateRoleScore(scores);
}

export async function getAllRatings(
  c: Context<HonoOptions>,
  projectId: string,
) {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }
  const ratings = await db(c)
    .select({
      roleId: Ratings.roleId,
      participantId: Ratings.participantId,
      score: Ratings.score,
    })
    .from(Ratings)
    .where(eq(Ratings.projectId, projectId));

  return hydrateRoleScore(ratings);
}

/**
 * Rating is `roleId`: score here, NOT `roleId->participantId`. fuck somebody's going to stumble upon this.
 */
type Rating = Record<string, number>;
export async function insertBulkRatings(
  c: Context<HonoOptions>,
  projectId: string,
  name: string,
  personalRatings: Rating,
) {
  const browserId = await getParticipantIdOrInsert(c, name, projectId);
  const ratings = Object.fromEntries(
    Object.entries(personalRatings).map(([roleId, score]) => {
      return [`${roleId}->scored->${browserId}`, score];
    }),
  );
  const dbRatings = dehydrateRoleScore(ratings);
  await db(c)
    .insert(Ratings)
    .values(
      dbRatings.map((r) => ({
        id: crypto.randomUUID(),
        projectId,
        participantId: r.participantId,
        roleId: r.roleId,
        score: r.score,
      })),
    );
}

export async function deleteAllPreviousRatings(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const browserId = await getBrowserID(c);
  await db(c)
    .delete(Ratings)
    .where(
      and(
        eq(Ratings.projectId, projectId),
        exists(
          db(c)
            .select({ id: Participants.id })
            .from(Participants)
            .where(eq(Participants.browserId, browserId)),
        ),
      ),
    );
}
