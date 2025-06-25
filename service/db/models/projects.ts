import { and, eq, exists } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types";
import {
  type InsertProjectOutput,
  InsertProjectPartial,
  SelectProject,
} from "share/schema.ts";
import * as v from "valibot";
import { getBrowserID } from "../../features/auth/index.ts";
import { db, preparedQueries } from "../client.ts";
import { Participants, Projects } from "../schema.ts";

export async function createProject(
  c: Context<HonoOptions>,
  project: InsertProjectOutput,
) {
  const d = db(c);
  const randomId = crypto.randomUUID();
  await d.insert(Projects).values({
    ...project,
    id: randomId,
    closedAt: null,
  });
}
export async function getProject(c: Context<HonoOptions>, projectId: string) {
  const projects = await preparedQueries(c).getProjectById.execute({
    id: projectId,
  });
  if (!projects[0])
    throw new HTTPException(404, { message: "project not found" });
  return projects[0];
}

export async function getSubmittedProjects(
  c: Context<HonoOptions>,
): Promise<SelectProject[]> {
  const d = db(c);
  const browserId = await getBrowserID(c);
  const projects = await d
    .select({
      id: Projects.id,
      name: Projects.name,
      description: Projects.description,
      closedAt: Projects.closedAt,
      multipleRoles: Projects.multipleRoles,
      dropTooManyRoles: Projects.dropTooManyRoles,
    })
    .from(Projects)
    .where(
      exists(
        d
          .select()
          .from(Participants)
          .where(
            and(
              eq(Participants.projectId, Projects.id),
              eq(Participants.browserId, browserId),
            ),
          ),
      ),
    );

  return projects.map((p) => v.parse(SelectProject, p));
}

export async function applyPatchToProject(
  c: Context<HonoOptions>,
  projectId: string,
  patch: InsertProjectPartial,
) {
  if (
    patch.name ||
    patch.description ||
    patch.dropTooManyRoles !== undefined ||
    patch.multipleRoles !== undefined
  ) {
    await db(c)
      .update(Projects)
      .set(patch)
      .where(eq(Projects.id, projectId))
      .returning({
        id: Projects.id,
        name: Projects.name,
        description: Projects.description,
        multipleRoles: Projects.multipleRoles,
        dropTooManyRoles: Projects.dropTooManyRoles,
        closedAt: Projects.closedAt,
      });
  }
}

export async function deleteProject(
  c: Context<HonoOptions>,
  projectId: string,
) {
  const browserId = await getBrowserID(c);
  const d = db(c);

  await d.delete(Projects).where(
    and(
      eq(Projects.id, projectId),
      exists(
        d
          .select()
          .from(Participants)
          .where(
            and(
              eq(Participants.browserId, browserId),
              eq(Participants.isAdmin, 1),
            ),
          ),
      ),
    ),
  );
}
