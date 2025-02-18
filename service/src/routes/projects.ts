import { vValidator } from "@hono/valibot-validator";
import { db } from "../../db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "../../db/schema.ts";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import type { HonoOptions } from "../types.ts";
import { json, param } from "../../validator/hono.ts";

const route = new Hono<HonoOptions>()
  .get(
    "/:projectId",
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const projectId = c.req.valid("param").projectId;
      const project_resp = await db(c).select().from(projects).where(eq(projects.id, projectId));
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
    vValidator(
      "json",
      v.object({
        name: v.string(),
        description: v.string(),
        role: v.array(v.object({
          name: v.string(),
          min: v.number(),
          max: v.number(),
        })),
      }),
    ),
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
      await db(c).update(projects).set({
        closed_at: new Date().toISOString(),
      }).where(eq(projects.id, c.req.valid("param").projectId));

      // TODO: ここでマッチ計算

      return c.json({}, 200);
    },
  )
  .post(
    "/:projectId/preferences",
    json(
      v.object({
        accountId: v.nullable(v.string()),
        participantName: v.string(),
        ratings: v.array(v.object({
          roleId: v.string(),
          score: v.number(),
        })),
      }),
    ),
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
