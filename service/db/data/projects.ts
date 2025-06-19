import { and, eq, exists } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "service/types";
import { getBrowserID } from "../../features/auth/index.ts";
import { db } from "../client.ts";
import { Participants, Projects } from "../schema.ts";
import {
  dehydratePartialProject,
  dehydrateProject,
  hydrateProject,
} from "../transformers/projects.ts";

export type CreateProject = {
  name: string;
  description: string | null;
  multipleRoles: boolean;
  dropTooManyRoles: boolean;
};
export async function createProject(
  c: Context<HonoOptions>,
  project: CreateProject,
) {
  const d = db(c);
  const randomId = crypto.randomUUID();
  await d.insert(Projects).values(
    dehydrateProject({
      ...project,
      id: randomId,
      closedAt: null,
    }),
  );
}
export async function getProject(c: Context<HonoOptions>, projectId: string) {
  const projects = await db(c)
    .select()
    .from(Projects)
    .where(eq(Projects.id, projectId))
    .limit(1);
  if (!projects[0])
    throw new HTTPException(404, { message: "project not found" });
  return hydrateProject(projects[0]);
}

export async function getSubmittedProjects(c: Context<HonoOptions>) {
  const d = db(c);
  const browserId = await getBrowserID(c);
  const projects = await d
    .select({
      id: Projects.id,
      name: Projects.name,
      description: Projects.description,
      closedAt: Projects.closedAt,
      isAdmin: Participants.isAdmin,
      multipleRoles: Projects.multipleRoles,
      dropTooManyRoles: Projects.dropTooManyRoles,
    })
    .from(Projects)
    .where(
      exists(
        d
          .select()
          .from(Participants)
          .where(eq(Participants.browserId, browserId)),
      ),
    );
  return projects.map(hydrateProject);
}

type ProjectPatch = {
  name?: string;
  description?: string | null;
  dropTooManyRoles?: boolean;
  multipleRoles?: boolean;
};

export async function applyPatchToProject(
  c: Context<HonoOptions>,
  projectId: string,
  patch: ProjectPatch,
) {
  if (
    patch.name ||
    patch.description ||
    patch.dropTooManyRoles !== undefined ||
    patch.multipleRoles !== undefined
  ) {
    const updateQuery = dehydratePartialProject({
      name: patch.name,
      description: patch.description,
      dropTooManyRoles: patch.dropTooManyRoles,
      multipleRoles: patch.multipleRoles,
    });
    await db(c)
      .update(Projects)
      .set(updateQuery)
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
