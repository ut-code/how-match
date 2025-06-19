import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { at } from "share/lib.ts";
import { multipleMatch } from "share/logic/min-flow/multiple.ts";
import { assignRoles } from "share/logic/min-flow/single.ts";
import { isAdmin } from "../../features/auth/rules.ts";
import type { HonoOptions } from "../../types.ts";
import { db } from "../client.ts";
import { deleteAllMatches } from "../data/matches.ts";
import { getParticipantsWithPreferences } from "../data/participants.ts";
import { getProject } from "../data/projects.ts";
import { Matches, Projects, Ratings, Roles } from "../schema.ts";
import { flattenMatchingResult } from "../transformers/matches.ts";

export async function assignAndSave(
  c: Context<HonoOptions>,
  projectId: string,
) {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }

  await deleteAllMatches(c, projectId);

  const projectData = await getProject(c, projectId);

  if (projectData.multipleRoles) {
    // multiple mode
    const participants = await getParticipantsWithPreferences(c, projectId);

    const roleConstraints = await db(c)
      .select()
      .from(Roles)
      .where(eq(Roles.projectId, projectId))
      .orderBy(Roles.id);

    const roleInput = roleConstraints.map((role) => ({
      id: role.id,
      capacity: role.max,
      minimum: role.min,
    }));

    const matching = multipleMatch(participants, roleInput, {
      dropTooManyRoles: projectData.dropTooManyRoles,
    });

    const result = flattenMatchingResult(matching, projectId);

    // HACK: Cloudflare cannot handle too many SQL variables
    // see more here: <https://zenn.dev/motoi/scraps/92309135b74618>
    await Promise.all(
      result.map((dataRow) => {
        return db(c).insert(Matches).values(dataRow);
      }),
    );
  } else {
    // single mode
    const participantsData = await db(c)
      .select()
      .from(Ratings)
      .where(eq(Ratings.projectId, projectId))
      .orderBy(Ratings.participantId, Ratings.roleId);

    const ratingsByParticipant = Map.groupBy(
      participantsData,
      (item) => item.participantId,
    );

    const ratingsArray: number[][] = []; // TODO: 型付けをマシにする
    const participantIndexIdMap: string[] = [];

    ratingsByParticipant.forEach((r) => {
      ratingsArray.push(r.map((item) => item.score));
      participantIndexIdMap.push(r[0]?.participantId ?? "-");
    });

    const roleConstraints = await db(c)
      .select()
      .from(Roles)
      .where(eq(Roles.projectId, projectId))
      .orderBy(Roles.id);
    const minMaxConstraints = roleConstraints.map((role) => ({
      min: role.min,
      max: role.max,
    }));

    const result = assignRoles(
      ratingsArray,
      at(ratingsArray, 0).length,
      minMaxConstraints,
    );

    // HACK: Cloudflare cannot handle too many SQL variables
    // see more here: <https://zenn.dev/motoi/scraps/92309135b74618>
    await Promise.all(
      result
        .map((r) => ({
          id: crypto.randomUUID(),
          projectId: projectId,
          roleId: roleConstraints[r.role]?.id ?? "-",
          participantId: participantIndexIdMap[r.participant] ?? "-",
        }))
        .map((dataRow) => {
          return db(c).insert(Matches).values(dataRow);
        }),
    );
  }
  await db(c)
    .update(Projects)
    .set({
      closedAt: new Date().toISOString(),
    })
    .where(eq(Projects.id, projectId));
}
