import { and, eq, exists, or } from "drizzle-orm";
import type { Context } from "hono";
import type { InsertPreference, Ratings } from "share/schema.ts";
import { getBrowserID } from "../../features/auth/index.ts";
import type { HonoOptions } from "../../types.ts";
import { db } from "../client.ts";
import { Participants, Ratings as RatingsTable } from "../schema.ts";
import { structureParticipants } from "../transformers/matches.ts";
import { getPreviousRatings } from "./ratings.ts";

/**
 * this is a superset of getPreviousRatings
 */
export async function getPreviousSubmission(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<
  | {
      id: string;
      name: string;
      rolesCount: number;
      isAdmin: number;
      ratings: Ratings;
    }
  | undefined
> {
  const browserId = await getBrowserID(c);
  const prevSubmission = await db(c)
    .select({
      id: Participants.id,
      name: Participants.name,
      rolesCount: Participants.rolesCount,
      isAdmin: Participants.isAdmin,
    })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.browserId, browserId),
      ),
    );

  const prev = prevSubmission[0];
  if (!prev) return undefined;

  const ratings = await getPreviousRatings(c, projectId);
  return {
    id: prev.id,
    name: prev.name,
    rolesCount: prev.rolesCount,
    isAdmin: prev.isAdmin,
    ratings,
  };
}

export async function getParticipantsWithPreferences(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const participantsWithPreferences = await db(c)
    .select({
      id: Participants.id,
      rolesCount: Participants.rolesCount,
      score: RatingsTable.score,
      roleId: RatingsTable.roleId,
    })
    .from(Participants)
    .innerJoin(
      RatingsTable,
      and(
        eq(Participants.id, RatingsTable.participantId),
        eq(Participants.projectId, RatingsTable.projectId),
      ),
    )
    .where(eq(Participants.projectId, projectId));

  return structureParticipants(participantsWithPreferences);
}

// because admins are not submitted but are participants (will I regret this?)
export async function getSubmittedParticipants(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const d = db(c);
  return await d
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
              .select({ id: RatingsTable.id })
              .from(RatingsTable)
              .where(eq(RatingsTable.participantId, Participants.id)),
          ),
        ),
      ),
    );
}

export async function getParticipantIdOrInsert(
  c: Context<HonoOptions>,
  name: string,
  projectId: string,
) {
  const browserId = await getBrowserID(c);
  const participant = await db(c)
    .select({ id: Participants.id })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.browserId, browserId),
      ),
    );
  if (participant[0]) return participant[0].id;
  const inserted = await db(c)
    .insert(Participants)
    .values({
      id: crypto.randomUUID(),
      browserId,
      name,
      projectId,
      rolesCount: 1,
      isAdmin: 1,
    })
    .returning();
  return inserted[0].id;
}

export async function insertParticipant(
  c: Context<HonoOptions>,
  projectId: string,
  data: InsertPreference,
) {
  const browserId = await getBrowserID(c);

  const inserted = await db(c)
    .insert(Participants)
    .values({
      id: crypto.randomUUID(),
      browserId,
      name: data.participantName,
      projectId,
      rolesCount: data.rolesCount,
      isAdmin: 0,
    })
    .returning();
  return inserted[0];
}
