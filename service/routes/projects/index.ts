import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Projects } from "service/db/schema.ts";
import type { HonoOptions } from "service/types.ts";
import { json, param } from "service/validator/hono.ts";
import { InsertProject, Role, RoleWithId } from "share/schema.ts";
import * as v from "valibot";
import {
  applyPatchToProject,
  createProject,
  deleteProject,
  getProject,
  getSubmittedProjects,
} from "../..//db/data/projects.ts";
import { db } from "../../db/client.ts";
import { deleteAllMatches, getMatches } from "../../db/data/matches.ts";
import { getPreviousSubmission } from "../../db/data/participants.ts";
import { getPreviousRatings } from "../../db/data/ratings.ts";
import { applyPatchesToRoles } from "../../db/data/roles.ts";
import { assignAndSave } from "../../db/kit/assign.ts";
import { isAdmin } from "../../features/auth/rules.ts";
import participantRoutes from "./participants.ts";
import preferenceRoutes from "./preferences.ts";

const route = new Hono<HonoOptions>()
  .route("/:projectId/participants", participantRoutes)
  .route("/:projectId/preferences", preferenceRoutes)

  .get("/mine", async (c) => {
    const projects = await getSubmittedProjects(c);
    return c.json(projects);
  })

  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const projectId = c.req.valid("param").projectId;

      const project = getProject(c, projectId);
      const prev = getPreviousSubmission(c, projectId);
      const roles = getPreviousRatings(c, projectId);
      return c.json({
        project: await project,
        roles: await roles,
        prev: await prev,
      });
    },
  )

  .patch(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    json(
      v.object({
        project: v.optional(v.partial(InsertProject)),
        roles: v.optional(
          v.object({
            create: v.optional(v.array(Role)),
            update: v.optional(v.array(RoleWithId)),
            delete: v.optional(v.array(v.string())),
          }),
        ),
      }),
    ),
    async (c) => {
      const params = c.req.valid("param");
      const body = c.req.valid("json");

      if (!(await isAdmin(c, params.projectId))) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      if (body.roles) {
        await applyPatchesToRoles(c, params.projectId, body.roles);
      }
      if (body.project) {
        await applyPatchToProject(c, params.projectId, body.project);
      }

      return c.json({ ok: true }, 200);
    },
  )

  .post("/", json(InsertProject), async (c) => {
    const json = c.req.valid("json");
    await createProject(c, json);
    return c.json({ ok: true }, 200);
  })
  .delete(
    "/:projectId",
    param({ projectId: v.pipe(v.string(), v.uuid()) }),
    async (c) => {
      const { projectId } = c.req.valid("param");
      await deleteProject(c, projectId);
      return c.json({ ok: true }, 200);
    },
  )

  .put("/:projectId/finalize", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    await assignAndSave(c, projectId);
    return c.json({ ok: true }, 200);
  })

  // TODO: this API seems redundant; let's just allow re-calculating on an already closed project
  // or remove "closing" entirely because it doesn't make a lot of sense
  .put("/:projectId/reopen", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    if (!(await isAdmin(c, projectId))) {
      throw new HTTPException(401, { message: "Forbidden" });
    }

    const project = await getProject(c, projectId);
    if (project.closedAt) {
      throw new HTTPException(409, { message: "Project is not closed" });
    }

    // Delete existing matches
    await deleteAllMatches(c, projectId);

    // Reopen the project by setting closedAt to null
    await db(c)
      .update(Projects)
      .set({
        closedAt: null,
      })
      .where(eq(Projects.id, projectId));

    return c.json({ ok: true }, 200);
  })

  .get("/:projectId/result", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const project = await getProject(c, projectId);
    const role_participants = await getMatches(c, projectId);
    return c.json({
      role_participants,
      project,
    });
  });

export default route;
