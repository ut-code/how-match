import { db } from "../db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "../db/schema.ts";
import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import * as v from "valibot";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "../types.ts";
import { json, param } from "../validator/hono.ts";
import { PreferenceSchema, ProjectSchema } from "share/schema.ts";
import { getBrowserID } from "../features/auth/index.ts";

const route = new Hono<HonoOptions>()
  .get("/mine", async (c) => {
    const browser_id = await getBrowserID(c);
    const project_resp = await db(c)
      .select()
      .from(projects)
      .where(eq(participants.browser_id, browser_id))
      .innerJoin(participants, eq(projects.id, participants.project_id));
    return c.json(project_resp.map(
      (p) => ({
        id: p.projects.id,
        name: p.projects.name,
        description: p.projects.description,
        closed_at: p.projects.closed_at,
        is_admin: p.participants.is_admin,
      }),
    ));
  })
  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const projectId = c.req.valid("param").projectId;
      const project_resp = await db(c).select().from(projects).where(eq(projects.id, projectId));
      const project = project_resp[0];
      if (!project) throw new HTTPException(404);

      // エンティティの roles と被るため role_resp
      const role_resp = await db(c).select().from(roles).where(eq(roles.project_id, projectId));
      return c.json({
        ...project,
        roles: role_resp,
      });
    },
  )
  .post("/", json(ProjectSchema), async (c) => {
    const browser_id = await getBrowserID(c);
    const project_id = crypto.randomUUID();
    const body = c.req.valid("json");
    const project_resp = (await db(c)
      .insert(projects)
      .values([
        {
          id: project_id,
          name: body.name,
          description: body.description,
        },
      ]).returning())[0];
    if (!project_resp) throw new HTTPException(500, { message: "failed to create project" });
    await db(c)
      .insert(participants)
      .values([
        {
          id: crypto.randomUUID(),
          name: "admin",
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
      ).returning();
    return c.json({
      ...project_resp,
      roles: roles_resp,
    });
  })
  .patch(
    "/:projectId",
    json(
      v.object({
        done: v.boolean(),
      }),
    ),
    param({ projectId: v.string() }),
    async (c) => {
      // const browser_id = getCookie(c, "browser_id");
      // if (!browser_id) {
      //   return c.json({ message: "Unauthorized" }, 401);
      // }
      // const account_resp = await db(c)
      //   .select()
      //   .from(accounts)
      //   .where(eq(accounts.browser_id, browser_id));
      // if (account_resp.length === 0) {
      //   return c.json({ message: "Unauthorized" }, 401);
      // }
      // const participant_resp = await db(c)
      //   .select()
      //   .from(participants)
      //   .where(
      //     eq(participants.account_id, account_resp[0].id) &&
      //       eq(participants.project_id, c.req.param("projectId")),
      //   );
      // if (participant_resp.length === 0 || participant_resp[0].is_admin === 0) {
      //   return c.json({ message: "Unauthorized" }, 401);
      // }

      // await db(c)
      //   .update(projects)
      //   .set({
      //     closed_at: new Date().toISOString(),
      //   })
      //   .where(eq(projects.id, c.req.param("projectId")));

      // // TODO: ここでマッチ計算

      // return c.json({}, 200);
      const done = c.req.valid("json").done;
      switch (done) {
        case true: {
          await db(c)
            .update(projects)
            .set({
              closed_at: new Date().toISOString(),
            })
            .where(eq(projects.id, c.req.valid("param").projectId));
          // TODO: ここでマッチ計算
          return c.json({}, 200);
        }
        case false: {
          return c.json({}, 404);
        }
        default: {
          done satisfies never;
        }
      }
    },
  )
  .post(
    "/:projectId/preferences",
    json(PreferenceSchema),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browser_id = await getBrowserID(c);
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");

      const participantResult = await db(c)
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.browser_id, browser_id),
            eq(participants.project_id, projectId),
            // 管理者も参加者として希望を出す場合、管理者の participant はいらない
            eq(participants.is_admin, 0),
          ),
        )
        .limit(1);

      if (participantResult.length > 0) {
        return c.json({ message: "すでに希望を提出済です" }, 409);
      }

      const participant = (
        await db(c)
          .insert(participants)
          .values({
            id: crypto.randomUUID(),
            name: body.participantName,
            browser_id: browser_id,
            project_id: projectId,
            is_admin: 0,
          })
          .returning()
      )[0];
      if (!participant) throw new HTTPException(500, { message: "failed to insert participant" });

      await db(c).insert(ratings).values(
        body.ratings.map((r) => ({
          id: crypto.randomUUID(),
          name: body.participantName,
          participant_id: participant.id,
          role_id: r.roleId,
          score: r.score,
          project_id: projectId,
        })),
      );
      return c.json({ ok: true }, 201);
    },
  )
  .get("/:projectId/result", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    const match_result = await db(c)
      .select({
        role_id: matches.role_id,
        participant_id: matches.participant_id,
        role_name: roles.name,
        account_name: accounts.name,
        project_name: projects.name,
        project_desc: projects.description,
      })
      .from(matches)
      .where(eq(matches.project_id, projectId))
      .innerJoin(roles, eq(matches.role_id, roles.id))
      .innerJoin(participants, eq(matches.participant_id, participants.id))
      // TODO: 非効率
      .innerJoin(projects, eq(matches.project_id, projects.id));
    return c.json(match_result);
  });

export default route;
