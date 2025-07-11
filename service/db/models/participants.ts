import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  type InsertPreference,
  type Ratings,
  SelectParticipants,
} from "share/schema.ts";
import * as v from "valibot";
import { getCurrentUserId, requireAuth } from "../../features/auth/index.ts";
import { isAdmin } from "../../features/auth/rules.ts";
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
      isAdmin: boolean;
      ratings: Ratings;
    }
  | undefined
> {
  const userId = await getCurrentUserId(c);
  if (!userId) return undefined;

  const prevSubmission = await db(c)
    .select({
      id: Participants.id,
      name: Participants.name,
      rolesCount: Participants.rolesCount,
    })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.userId, userId),
      ),
    );

  const isUserAdmin = await isAdmin(c, projectId);

  const prev = prevSubmission[0];
  if (!prev) return undefined;

  const ratings = await getPreviousRatings(c, projectId);
  return {
    id: prev.id,
    name: prev.name,
    rolesCount: prev.rolesCount,
    isAdmin: isUserAdmin,
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

export async function getParticipants(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<SelectParticipants> {
  const d = db(c);
  const participants: v.InferInput<typeof SelectParticipants> = await d
    .select({
      id: Participants.id,
      name: Participants.name,
      rolesCount: Participants.rolesCount,
    })
    .from(Participants)
    .where(eq(Participants.projectId, projectId));

  return v.parse(SelectParticipants, participants);
}
export async function getParticipantId(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const userId = await getCurrentUserId(c);
  if (!userId) return undefined;

  const participant = await db(c)
    .select({ id: Participants.id })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.userId, userId),
      ),
    );
  return participant[0]?.id;
}
export async function getParticipantIdOrInsert(
  c: Context<HonoOptions>,
  name: string,
  projectId: string,
) {
  const userId = await requireAuth(c);
  const participant = await db(c)
    .select({ id: Participants.id })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.userId, userId),
      ),
    );
  if (participant[0]) return participant[0].id;
  const inserted = await db(c)
    .insert(Participants)
    .values({
      id: crypto.randomUUID(),
      userId,
      name,
      projectId,
      rolesCount: 1,
    })
    .returning();
  return inserted[0].id;
}

export async function insertParticipant(
  c: Context<HonoOptions>,
  projectId: string,
  submission: InsertPreference,
) {
  const userId = await requireAuth(c);

  const inserted = await db(c)
    .insert(Participants)
    .values({
      id: crypto.randomUUID(),
      userId,
      name: submission.participantName,
      projectId,
      rolesCount: submission.rolesCount,
    })
    .returning();

  return inserted[0];
}

export async function deleteParticipant(
  c: Context<HonoOptions>,
  projectId: string,
  participantId: string,
) {
  const userId = await getCurrentUserId(c);
  if (!userId) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  const is_admin = await isAdmin(c, projectId);

  // Check if user owns this participant record
  const participant = await db(c)
    .select({ userId: Participants.userId })
    .from(Participants)
    .where(eq(Participants.id, participantId))
    .limit(1);

  const is_self = participant[0]?.userId === userId;

  if (!(is_admin || is_self)) {
    throw new HTTPException(401, { message: "Forbidden" });
  }

  await db(c)
    .delete(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.id, participantId),
      ),
    );
}
