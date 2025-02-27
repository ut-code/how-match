import { and, eq, exists } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "service/db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "service/db/schema.ts";
import { getBrowserID } from "service/features/auth/index.ts";
import type { HonoOptions } from "service/types.ts";
import { json, param } from "service/validator/hono.ts";
import { ProjectSchema } from "share/schema.ts";
import * as v from "valibot";

import preferenceRoutes from "./preferences.ts";

const route = new Hono<HonoOptions>()
  .route("/:projectId/preferences", preferenceRoutes)

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
      const project_resp = db(c).select().from(projects).where(eq(projects.id, projectId)).execute();
      const project = project_resp.then((it) => {
        const project = it[0];
        if (!project) {
          throw new HTTPException(404);
        }
        return project;
      });

      const prev_participant_data = (
        await db(c)
          .select({
            id: participants.id,
            name: participants.name,
          })
          .from(participants)
          .where(
            and(
              eq(participants.project_id, projectId),
              eq(participants.browser_id, browser_id),
              eq(participants.is_admin, 0),
            ),
          )
      )[0];
      // エンティティの roles と被るため role_resp
      const role_resp = db(c)
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
          },
        ])
        .returning()
    )[0];
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
      )
      .returning();
    return c.json({
      ...project_resp,
      roles: roles_resp,
    });
  })
  .delete("/:projectId", param({ projectId: v.pipe(v.string(), v.uuid()) }), async (c) => {
    const browser_id = await getBrowserID(c);
    const { projectId: project_id } = c.req.valid("param");
    const d = db(c);
    await d
      .delete(projects)
      .where(
        and(
          eq(projects.id, project_id),
          exists(
            d.select().from(participants).where(
              and(
                eq(participants.browser_id, browser_id),
                eq(participants.is_admin, 1),
              ),
            ),
          ),
        ),
      );
    return c.json({ ok: true }, 200);
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
