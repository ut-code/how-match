import { and, eq, exists } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types";
import {
  type InsertProjectOutput,
  type InsertProjectPartial,
  SelectProject,
} from "share/schema.ts";
import * as v from "valibot";
import { getCurrentUserId } from "../../features/auth/index.ts";
import { isAdmin } from "../../features/auth/rules.ts";
import { db } from "../client.ts";
import { Admins, Participants, Projects } from "../schema.ts";

const SelectProjects = v.array(SelectProject);
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
  return randomId;
}
export async function getProject(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<SelectProject> {
  const projects = await db(c)
    .select()
    .from(Projects)
    .where(eq(Projects.id, projectId));
  if (!projects[0])
    throw new HTTPException(404, { message: "project not found" });
  return v.parse(SelectProject, projects[0]);
}

export async function getMyProjects(
  c: Context<HonoOptions>,
): Promise<{ participated: SelectProject[]; admin: SelectProject[] }> {
  const d = db(c);
  const userId = await getCurrentUserId(c);

  if (!userId) {
    return { participated: [], admin: [] };
  }

  const participatedProjects = await d
    .select()
    .from(Projects)
    .where(
      exists(
        d
          .select()
          .from(Participants)
          .where(
            and(
              eq(Participants.projectId, Projects.id),
              eq(Participants.userId, userId),
            ),
          ),
      ),
    );

  const adminProjects = await d
    .select()
    .from(Projects)
    .where(
      exists(
        d
          .select()
          .from(Admins)
          .where(
            and(eq(Admins.userId, userId), eq(Admins.projectId, Projects.id)),
          ),
      ),
    );

  return {
    participated: v.parse(SelectProjects, participatedProjects),
    admin: v.parse(SelectProjects, adminProjects),
  };
}

export async function applyPatchToProject(
  c: Context<HonoOptions>,
  projectId: string,
  patch: InsertProjectPartial,
) {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }

  if (
    patch.name ||
    patch.description ||
    patch.dropTooManyRoles !== undefined ||
    patch.multipleRoles !== undefined
  ) {
    await db(c).update(Projects).set(patch).where(eq(Projects.id, projectId));
  }
}

export async function deleteProject(
  c: Context<HonoOptions>,
  projectId: string,
) {
  if (!(await isAdmin(c, projectId))) {
    throw new HTTPException(401, { message: "Forbidden" });
  }

  const d = db(c);
  await d.delete(Projects).where(eq(Projects.id, projectId));
}
