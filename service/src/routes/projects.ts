import { zValidator } from "@hono/zod-validator";
import { db } from "db/client";
import { account, match, participant, project, rating, role } from "db/schema";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const projects = new Hono()
  .get("/:projectId", async (c) => {
    const projectId = c.req.param("projectId");
    const project_resp = await db(c).select().from(project).where(eq(project.id, projectId));
    const role_resp = await db(c).select().from(role).where(eq(role.project_id, projectId));
    return c.json({
      id: project_resp[0].id,
      name: project_resp[0].name,
      description: project_resp[0].description,
      role: role_resp,
    });
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
        description: z.string(),
        role: z.array(z.object({
          name: z.string(),
          min: z.number(),
          max: z.number(),
        })),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const project_id = crypto.randomUUID();
      await db(c).insert(project).values([
        {
          id: project_id,
          name: body.name,
          description: body.description,
        },
      ]);
      await db(c).insert(role).values(
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
    zValidator(
      "json",
      z.object({
        done: z.boolean(),
      }),
    ),
    async (c) => {
      await db(c).update(project).set({
        closed_at: new Date().toISOString(),
      }).where(eq(project.id, c.req.param("projectId")));

      // TODO: ここでマッチ計算

      return c.json({}, 200);
    },
  )
  .post(
    "/:projectId/preferences",
    zValidator(
      "json",
      z.object({
        accountId: z.string().nullable(),
        participantName: z.string(),
        ratings: z.array(z.object({
          roleId: z.string(),
          score: z.number(),
        })),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      const new_account_id = crypto.randomUUID();
      const participant_id = crypto.randomUUID();
      await db(c).insert(rating).values(
        body.ratings.map((r) => ({
          id: crypto.randomUUID(),
          participant_id: participant_id,
          role_id: r.roleId,
          score: r.score,
          project_id: c.req.param("projectId"),
        })),
      );

      if (body.accountId === null) {
        await db(c).insert(account).values([
          {
            id: new_account_id,
            name: body.participantName,
          },
        ]);
      }
      await db(c).insert(participant).values(
        {
          id: participant_id,
          account_id: body.accountId ?? new_account_id,
          project_id: c.req.param("projectId"),
          is_admin: 0,
        },
      );
      return c.json({}, 201);
    },
  )
  .get(
    "/:projectId/result",
    async (c) => {
      const match_result = await db(c).select().from(match).where(eq(match.project_id, c.req.param("projectId")));
      return c.json(match_result);
    },
  );
