import { and, eq, exists } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "service/db/client.ts";
import {
  Matches,
  Participants,
  Projects,
  Ratings,
  Roles,
} from "service/db/schema.ts";
import { getBrowserID } from "service/features/auth/index.ts";
import type { HonoOptions } from "service/types.ts";
import { json, param } from "service/validator/hono.ts";
import { assignRoles } from "share/logic/min-flow.ts";
import { multipleMatch } from "share/logic/multiple.ts";
import { Project, Role, RoleWithId } from "share/schema.ts";
import * as v from "valibot";

import { at } from "share/lib.ts";
import participantRoute from "./participants.ts";
import preferenceRoutes from "./preferences.ts";

const route = new Hono<HonoOptions>()
  .route("/:projectId/preferences", preferenceRoutes)
  .route("/:projectId/participants", participantRoute)

  .get("/mine", async (c) => {
    const browserId = await getBrowserID(c);
    const project_resp = await db(c)
      .select()
      .from(Projects)
      .innerJoin(Participants, eq(Projects.id, Participants.projectId))
      .where(eq(Participants.browserId, browserId));
    return c.json(
      project_resp.map((p) => ({
        id: p.projects.id,
        name: p.projects.name,
        description: p.projects.description,
        closedAt: p.projects.closedAt,
        isAdmin: p.participants.isAdmin,
      })),
    );
  })

  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browserId = await getBrowserID(c);
      const projectId = c.req.valid("param").projectId;
      const d = db(c);
      const project_resp = d
        .select()
        .from(Projects)
        .where(eq(Projects.id, projectId))
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
            id: Participants.id,
            name: Participants.name,
            rolesCount: Participants.rolesCount,
          })
          .from(Participants)
          .where(
            and(
              eq(Participants.projectId, projectId),
              eq(Participants.browserId, browserId),
            ),
          )
      )[0];
      // エンティティの roles と被るため role_resp
      const role_resp = d
        .select({
          id: Roles.id,
          name: Roles.name,
          min: Roles.min,
          max: Roles.max,
          prev: Ratings.score,
        })
        .from(Roles)
        .where(eq(Roles.projectId, projectId))
        .leftJoin(
          Ratings,
          and(
            eq(Ratings.roleId, Roles.id),
            eq(Ratings.participantId, prev_participant_data?.id ?? "never"), // omit if prev_userdata doesn't exist
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
            create: v.optional(v.array(Role)),
            update: v.optional(v.array(RoleWithId)),
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
      const isAdmin = await d
        .select()
        .from(Participants)
        .where(
          and(
            eq(Participants.browserId, browserId),
            eq(Participants.projectId, params.projectId),
            eq(Participants.isAdmin, 1),
          ),
        );
      if (isAdmin.length === 0) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const projectData = (
        await d.select().from(Projects).where(eq(Projects.id, params.projectId))
      )[0];

      if (!projectData) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      let rolesRes: RoleWithId[] | undefined;
      if (body.roles) {
        if (body.roles.create && body.roles.create.length > 0) {
          await d.insert(Roles).values(
            body.roles.create.map((role) => ({
              ...role,
              id: crypto.randomUUID(),
              projectId: params.projectId,
            })),
          );
        }
        if (body.roles.update && body.roles.update.length > 0) {
          for (const role of body.roles.update) {
            await d
              .update(Roles)
              .set({ name: "hello" })
              .where(
                and(
                  eq(Roles.id, role.id),
                  eq(Roles.projectId, params.projectId),
                ),
              );
          }
        }
        if (body.roles.delete && body.roles.delete.length > 0) {
          for (const role of body.roles.delete) {
            await d
              .delete(Roles)
              .where(
                and(eq(Roles.id, role), eq(Roles.projectId, params.projectId)),
              );
          }
        }
        rolesRes = await d
          .select()
          .from(Roles)
          .where(eq(Roles.projectId, params.projectId));
      }

      let projectRes: Omit<Project, "roles"> | undefined;
      if (body.name || body.description) {
        const p = await d
          .update(Projects)
          .set({
            name: body.name,
            description: body.description,
          })
          .where(eq(Projects.id, params.projectId))
          .returning();
        projectRes = p[0] && { ...p[0], multipleRoles: p[0].multipleRoles };
      }
      return c.json({ ok: true, roles: rolesRes, project: projectRes }, 200);
    },
  )

  .post("/", json(Project), async (c) => {
    const browserId = await getBrowserID(c);
    const projectId = crypto.randomUUID();
    const body = c.req.valid("json");
    const project_resp = (
      await db(c)
        .insert(Projects)
        .values([
          {
            id: projectId,
            name: body.name,
            description: body.description,
            multipleRoles: body.multipleRoles,
          },
        ])
        .returning()
    )[0];
    if (!project_resp)
      throw new HTTPException(500, { message: "failed to create project" });
    await db(c)
      .insert(Participants)
      .values([
        {
          rolesCount: 0,
          id: crypto.randomUUID(),
          name: "",
          browserId,
          projectId: projectId,
          isAdmin: 1,
        },
      ]);

    const roles_resp = await db(c)
      .insert(Roles)
      .values(
        body.roles.map((r) => ({
          id: crypto.randomUUID(),
          name: r.name,
          min: r.min,
          max: r.max,
          projectId: projectId,
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
      const browserId = await getBrowserID(c);
      const { projectId } = c.req.valid("param");
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
      return c.json({ ok: true }, 200);
    },
  )

  .put("/:projectId/finalize", param({ projectId: v.string() }), async (c) => {
    const browserId = await getBrowserID(c);
    const { projectId } = c.req.valid("param");
    if (!browserId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const participant_resp = await db(c)
      .select()
      .from(Participants)
      .where(
        eq(Participants.browserId, browserId) &&
          eq(Participants.projectId, c.req.param("projectId")),
      );
    if (participant_resp.map((p) => p.isAdmin).includes(1) === false) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const projectData = (
      await db(c).select().from(Projects).where(eq(Projects.id, projectId))
    )[0];

    if (!projectData) {
      throw new HTTPException(404, { message: "Project not found" });
    }

    if (projectData.closedAt) {
      throw new HTTPException(409, { message: "Project already finalized" });
    }

    if (projectData.multipleRoles) {
      // multiple mode
      const participantsWithPreferences = await db(c)
        .select({
          id: Participants.id,
          rolesCount: Participants.rolesCount,
          score: Ratings.score,
          roleId: Ratings.roleId,
        })
        .from(Participants)
        .innerJoin(
          Ratings,
          and(
            eq(Participants.id, Ratings.participantId),
            eq(Participants.projectId, Ratings.projectId),
          ),
        )
        .where(eq(Participants.projectId, projectId));

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
        .from(Roles)
        .where(eq(Roles.projectId, projectId))
        .orderBy(Roles.id);

      const roleInput = roleConstraints.map((role) => ({
        id: role.id,
        capacity: role.max, // multiple mode の場合、max と min は同一
      }));

      const matching = multipleMatch(participantInput, roleInput);

      const result: {
        id: string;
        projectId: string;
        roleId: string;
        participantId: string;
      }[] = [];
      matching.forEach((m) => {
        m.roleIds.forEach((roleId) => {
          result.push({
            id: crypto.randomUUID(),
            projectId: projectId,
            roleId: roleId,
            participantId: m.participantId,
          });
        });
      });

      await db(c).insert(Matches).values(result);
    } else {
      // default mode
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

      await db(c)
        .insert(Matches)
        .values(
          result.map((r) => ({
            id: crypto.randomUUID(),
            projectId: projectId,
            roleId: roleConstraints[r.role]?.id ?? "-",
            participantId: participantIndexIdMap[r.participant] ?? "-",
          })),
        );
    }
    await db(c)
      .update(Projects)
      .set({
        closedAt: new Date().toISOString(),
      })
      .where(eq(Projects.id, projectId));

    return c.json({}, 200);
  })
  .get("/:projectId/result", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const match_result = await db(c)
      .select({
        roleId: Matches.roleId,
        participantId: Matches.participantId,
        participantName: Participants.name,
        roleName: Roles.name,
        projectName: Projects.name,
        project_desc: Projects.description,
      })
      .from(Matches)
      .where(eq(Matches.projectId, projectId))
      .innerJoin(Roles, eq(Matches.roleId, Roles.id))
      .innerJoin(Participants, eq(Matches.participantId, Participants.id))
      // TODO: 非効率
      .innerJoin(Projects, eq(Matches.projectId, Projects.id));
    const participantsOnEachRole = match_result.reduce(
      (acc, cur) => {
        if (!acc[cur.roleId]) {
          acc[cur.roleId] = {
            roleName: cur.roleName,
            participants: [],
          };
        }
        acc[cur.roleId]?.participants.push({
          participantId: cur.participantId,
          participantName: cur.participantName,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          roleName: string;
          participants: { participantId: string; participantName: string }[];
        }
      >,
    );
    return c.json({
      participantsOnEachRole,
      projectName: match_result[0]?.projectName,
      projectDesc: match_result[0]?.project_desc,
    });
  });

export default route;
