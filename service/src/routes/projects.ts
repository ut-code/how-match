import { db } from "../../db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "../../db/schema.ts";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "../types.ts";
import { json, param } from "../../validator/hono.ts";
import { PreferenceSchema, ProjectSchema } from "../../validator/schemas.ts";

const route = new Hono<HonoOptions>()
  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const projectId = c.req.valid("param").projectId;
      const project_resp = await db(c).select().from(projects).where(eq(projects.id, projectId));
      if (project_resp.length === 0) {
        throw new HTTPException(404);
      }
      const role_resp = await db(c).select().from(roles).where(eq(roles.project_id, projectId));
      return c.json({
        id: project_resp[0].id,
        name: project_resp[0].name,
        description: project_resp[0].description,
        role: role_resp,
      });
    },
  )
  .post(
    "/",
    json(ProjectSchema),
    async (c) => {
      const body = c.req.valid("json");
      const project_id = crypto.randomUUID();
      await db(c).insert(projects).values([
        {
          id: project_id,
          name: body.name,
          description: body.description,
        },
      ]);
      await db(c).insert(roles).values(
        body.role.map((r) => ({
          id: crypto.randomUUID(),
          min: r.min,
          max: r.max,
          project_id: project_id,
        })),
      );
      return c.json({
        name: body.name,
        description: body.description,
        role: body.role,
      });
    },
  )
  .patch(
    "/:projectId",
    json(
      v.object({
        done: v.boolean(),
      }),
    ),
    param({ projectId: v.string() }),
    async (c) => {
      const done = c.req.valid("json").done;
      switch (done) {
        case true: {
          await db(c).update(projects).set({
            closed_at: new Date().toISOString(),
          }).where(eq(projects.id, c.req.valid("param").projectId));
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
      const body = c.req.valid("json");
      const { projectId } = c.req.valid("param");
      const new_account_id = crypto.randomUUID();
      const participant_id = crypto.randomUUID();
      await db(c).insert(ratings).values(
        body.ratings.map((r) => ({
          id: crypto.randomUUID(),
          participant_id: participant_id,
          role_id: r.roleId,
          score: r.score,
          project_id: projectId,
        })),
      );

      if (body.accountId === null) {
        await db(c).insert(accounts).values([
          {
            id: new_account_id,
            name: body.participantName,
          },
        ]);
      }
      await db(c).insert(participants).values(
        {
          id: participant_id,
          account_id: body.accountId ?? new_account_id,
          project_id: projectId,
          is_admin: 0,
        },
      );
      return c.json({}, 201);
    },
  )
  .get(
    "/:projectId/result",
    param({ projectId: v.string() }),
    async (c) => {
      const { projectId } = c.req.valid("param");
      const match_result = await db(c).select().from(matches).where(eq(matches.project_id, projectId));
      return c.json(match_result);
    },
  );

export default route;
