import { and, eq, exists } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "service/db/client.ts";
import {
  matches,
  participants,
  projects,
  ratings,
  roles,
} from "service/db/schema.ts";
import { getBrowserID } from "service/features/auth/index.ts";
import type { HonoOptions } from "service/types.ts";
import { json, param } from "service/validator/hono.ts";
import { assignRoles } from "share/logic/min-flow.ts";
import { multipleMatch } from "share/logic/multiple.ts";
import { ProjectSchema, RoleSchema, RoleWithIdSchema } from "share/schema.ts";
import type { Project, RoleWithId } from "share/types.ts";
import * as v from "valibot";

import { at } from "share/lib.ts";
import participantRoute from "./participants.ts";
import preferenceRoutes from "./preferences.ts";

const route = new Hono<HonoOptions>()
  .route("/:projectId/preferences", preferenceRoutes)
  .route("/:projectId/participants", participantRoute)

  .get("/mine", async (c) => {
    const browser_id = await getBrowserID(c);
    const project_resp = await db(c)
      .select()
      .from(projects)
      .innerJoin(participants, eq(projects.id, participants.project_id))
      .where(eq(participants.browser_id, browser_id));
    return c.json(
      project_resp.map((p) => ({
        id: p.projects.id,
        name: p.projects.name,
        description: p.projects.description,
        closed_at: p.projects.closed_at,
        is_admin: p.participants.is_admin,
      })),
    );
  })

  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browser_id = await getBrowserID(c);
      const projectId = c.req.valid("param").projectId;
      const d = db(c);
      const project_resp = d
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .execute();
      const project = project_resp.then((it) => {
        const project = it[0];
        if (!project) {
          throw new HTTPException(404);
        }
        return project;
      });

      const prev_participant_data = (
        await d
          .select({
            id: participants.id,
            name: participants.name,
            roles_count: participants.roles_count,
          })
          .from(participants)
          .where(
            and(
              eq(participants.project_id, projectId),
              eq(participants.browser_id, browser_id),
            ),
          )
      )[0];
      // エンティティの roles と被るため role_resp
      const role_resp = d
        .select({
          id: roles.id,
          name: roles.name,
          min: roles.min,
          max: roles.max,
          prev: ratings.score,
        })
        .from(roles)
        .where(eq(roles.project_id, projectId))
        .leftJoin(
          ratings,
          and(
            eq(ratings.role_id, roles.id),
            eq(ratings.participant_id, prev_participant_data?.id ?? "never"), // omit if prev_userdata doesn't exist
          ),
        )
        .execute();
      return c.json({
        project: await project,
        roles: await role_resp,
        prev: prev_participant_data,
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
        name: v.optional(v.string()),
        description: v.optional(v.nullable(v.string())),
        roles: v.optional(
          v.object({
            create: v.optional(v.array(RoleSchema)),
            update: v.optional(v.array(RoleWithIdSchema)),
            delete: v.optional(v.array(v.string())),
          }),
        ),
      }),
    ),
    async (c) => {
      const d = db(c);
      const browserId = await getBrowserID(c);
      const params = c.req.valid("param");
      const body = c.req.valid("json");

      if (!browserId) {
        return c.json({ message: "Unauthorized" }, 401);
      }
      const is_admin = await d
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.browser_id, browserId),
            eq(participants.project_id, params.projectId),
            eq(participants.is_admin, 1),
          ),
        );
      if (is_admin.length === 0) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const projectData = (
        await d.select().from(projects).where(eq(projects.id, params.projectId))
      )[0];

      if (!projectData) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      let rolesRes: RoleWithId[] | undefined;
      if (body.roles) {
        if (body.roles.create && body.roles.create.length > 0) {
          await d.insert(roles).values(
            body.roles.create.map((role) => ({
              ...role,
              id: crypto.randomUUID(),
              project_id: params.projectId,
            })),
          );
        }
        if (body.roles.update && body.roles.update.length > 0) {
          for (const role of body.roles.update) {
            await d
              .update(roles)
              .set({ name: "hello" })
              .where(
                and(
                  eq(roles.id, role.id),
                  eq(roles.project_id, params.projectId),
                ),
              );
          }
        }
        if (body.roles.delete && body.roles.delete.length > 0) {
          for (const role of body.roles.delete) {
            await d
              .delete(roles)
              .where(
                and(eq(roles.id, role), eq(roles.project_id, params.projectId)),
              );
          }
        }
        rolesRes = await d
          .select()
          .from(roles)
          .where(eq(roles.project_id, params.projectId));
      }

      let projectRes: Omit<Project, "roles"> | undefined;
      if (body.name || body.description) {
        const p = await d
          .update(projects)
          .set({
            name: body.name,
            description: body.description,
          })
          .where(eq(projects.id, params.projectId))
          .returning();
        projectRes = p[0] && { ...p[0], multipleRoles: p[0].multiple_roles };
      }
      return c.json({ ok: true, roles: rolesRes, project: projectRes }, 200);
    },
  )

  .post("/", json(ProjectSchema), async (c) => {
    const browser_id = await getBrowserID(c);
    const project_id = crypto.randomUUID();
    const body = c.req.valid("json");
    const project_resp = (
      await db(c)
        .insert(projects)
        .values([
          {
            id: project_id,
            name: body.name,
            description: body.description,
            multiple_roles: body.multipleRoles,
          },
        ])
        .returning()
    )[0];
    if (!project_resp)
      throw new HTTPException(500, { message: "failed to create project" });
    await db(c)
      .insert(participants)
      .values([
        {
          roles_count: 0,
          id: crypto.randomUUID(),
          name: "",
          browser_id,
          project_id: project_id,
          is_admin: 1,
        },
      ]);

    const roles_resp = await db(c)
      .insert(roles)
      .values(
        body.roles.map((r) => ({
          id: crypto.randomUUID(),
          name: r.name,
          min: r.min,
          max: r.max,
          project_id: project_id,
        })),
      )
      .returning();
    return c.json({
      ...project_resp,
      roles: roles_resp,
    });
  })
  .delete(
    "/:projectId",
    param({ projectId: v.pipe(v.string(), v.uuid()) }),
    async (c) => {
      const browser_id = await getBrowserID(c);
      const { projectId: project_id } = c.req.valid("param");
      const d = db(c);
      await d.delete(projects).where(
        and(
          eq(projects.id, project_id),
          exists(
            d
              .select()
              .from(participants)
              .where(
                and(
                  eq(participants.browser_id, browser_id),
                  eq(participants.is_admin, 1),
                ),
              ),
          ),
        ),
      );
      return c.json({ ok: true }, 200);
    },
  )

  .put("/:projectId/finalize", param({ projectId: v.string() }), async (c) => {
    const browser_id = await getBrowserID(c);
    const { projectId } = c.req.valid("param");
    if (!browser_id) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const participant_resp = await db(c)
      .select()
      .from(participants)
      .where(
        eq(participants.browser_id, browser_id) &&
          eq(participants.project_id, c.req.param("projectId")),
      );
    if (participant_resp.map((p) => p.is_admin).includes(1) === false) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const projectData = (
      await db(c).select().from(projects).where(eq(projects.id, projectId))
    )[0];

    if (!projectData) {
      throw new HTTPException(404, { message: "Project not found" });
    }

    if (projectData.closed_at) {
      throw new HTTPException(409, { message: "Project already finalized" });
    }

    if (projectData.multiple_roles) {
      // multiple mode
      const participantsWithPreferences = await db(c)
        .select({
          id: participants.id,
          rolesCount: participants.roles_count,
          score: ratings.score,
          roleId: ratings.role_id,
        })
        .from(participants)
        .innerJoin(
          ratings,
          and(
            eq(participants.id, ratings.participant_id),
            eq(participants.project_id, ratings.project_id),
          ),
        )
        .where(eq(participants.project_id, projectId));

      const preferencesByParticipant = Map.groupBy(
        participantsWithPreferences,
        (p) => p.id,
      );

      const participantInput = Array.from(
        preferencesByParticipant.entries(),
      ).map(([participantId, preferences]) => ({
        id: participantId,
        rolesCount: preferences[0]?.rolesCount ?? 0,
        preferences: preferences.map((p) => ({
          roleId: p.roleId,
          score: p.score,
        })),
      }));

      const roleConstraints = await db(c)
        .select()
        .from(roles)
        .where(eq(roles.project_id, projectId))
        .orderBy(roles.id);

      const roleInput = roleConstraints.map((role) => ({
        id: role.id,
        capacity: role.max, // multiple mode の場合、max と min は同一
      }));

      const matching = multipleMatch(participantInput, roleInput);

      const result: {
        id: string;
        project_id: string;
        role_id: string;
        participant_id: string;
      }[] = [];
      matching.forEach((m) => {
        m.roleIds.forEach((roleId) => {
          result.push({
            id: crypto.randomUUID(),
            project_id: projectId,
            role_id: roleId,
            participant_id: m.participantId,
          });
        });
      });

      await db(c).insert(matches).values(result);
    } else {
      // default mode
      const participantsData = await db(c)
        .select()
        .from(ratings)
        .where(eq(ratings.project_id, projectId))
        .orderBy(ratings.participant_id, ratings.role_id);

      const ratingsByParticipant = Map.groupBy(
        participantsData,
        (item) => item.participant_id,
      );

      const ratingsArray: number[][] = []; // TODO: 型付けをマシにする
      const participantIndexIdMap: string[] = [];

      ratingsByParticipant.forEach((r) => {
        ratingsArray.push(r.map((item) => item.score));
        participantIndexIdMap.push(r[0]?.participant_id ?? "-");
      });

      const roleConstraints = await db(c)
        .select()
        .from(roles)
        .where(eq(roles.project_id, projectId))
        .orderBy(roles.id);
      const minMaxConstraints = roleConstraints.map((role) => ({
        min: role.min,
        max: role.max,
      }));

      const result = assignRoles(
        ratingsArray,
        at(ratingsArray, 0).length,
        minMaxConstraints,
      );

      await db(c)
        .insert(matches)
        .values(
          result.map((r) => ({
            id: crypto.randomUUID(),
            project_id: projectId,
            role_id: roleConstraints[r.role]?.id ?? "-",
            participant_id: participantIndexIdMap[r.participant] ?? "-",
          })),
        );
    }
    await db(c)
      .update(projects)
      .set({
        closed_at: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId));

    return c.json({}, 200);
  })
  .get("/:projectId/result", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const match_result = await db(c)
      .select({
        role_id: matches.role_id,
        participant_id: matches.participant_id,
        participant_name: participants.name,
        role_name: roles.name,
        project_name: projects.name,
        project_desc: projects.description,
      })
      .from(matches)
      .where(eq(matches.project_id, projectId))
      .innerJoin(roles, eq(matches.role_id, roles.id))
      .innerJoin(participants, eq(matches.participant_id, participants.id))
      // TODO: 非効率
      .innerJoin(projects, eq(matches.project_id, projects.id));
    const participantsOnEachRole = match_result.reduce(
      (acc, cur) => {
        if (!acc[cur.role_id]) {
          acc[cur.role_id] = {
            role_name: cur.role_name,
            participants: [],
          };
        }
        acc[cur.role_id]?.participants.push({
          participant_id: cur.participant_id,
          participant_name: cur.participant_name,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          role_name: string;
          participants: { participant_id: string; participant_name: string }[];
        }
      >,
    );
    return c.json({
      participantsOnEachRole,
      projectName: match_result[0]?.project_name,
      projectDesc: match_result[0]?.project_desc,
    });
  });

export default route;
