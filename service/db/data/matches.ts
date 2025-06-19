import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types";
import { isAdmin } from "../../features/auth/rules.ts";
import { db } from "../client.ts";
import { Matches, Participants, Roles } from "../schema.ts";
import { structureMatches } from "../transformers/matches.ts";

export async function getMatches(c: Context<HonoOptions>, projectId: string) {
  const match_result = await db(c)
    .select({
      roleId: Matches.roleId,
      participantId: Matches.participantId,
    })
    .from(Matches)
    .where(eq(Matches.projectId, projectId))
    .innerJoin(Roles, eq(Matches.roleId, Roles.id))
    .innerJoin(Participants, eq(Matches.participantId, Participants.id));
  return structureMatches(match_result);
}

export async function deleteAllMatches(
  c: Context<HonoOptions>,
  projectId: string,
) {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }
  const d = db(c);
  return d.delete(Matches).where(eq(Matches.projectId, projectId));
}
