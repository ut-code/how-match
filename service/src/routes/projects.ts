import { zValidator } from "@hono/zod-validator";
import { db } from "../../db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "../../db/schema.ts";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { deleteCookie, getCookie, getSignedCookie, setCookie, setSignedCookie } from "hono/cookie";
import type { HonoOptions } from "../types.ts";

const route = new Hono<HonoOptions>()
  .get("/:projectId", async (c) => {
    const projectId = c.req.param("projectId");
    const project_resp = await db(c).select().from(projects).where(eq(projects.id, projectId));
    const role_resp = await db(c).select().from(roles).where(eq(roles.project_id, projectId));
    if (project_resp.length === 0) {
      return c.json({ message: "Not Found" }, 404);
    }
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
        description: z.string().nullable(),
        roles: z.array(z.object({
          name: z.string(),
          min: z.number(),
          max: z.number(),
        })),
      }),
    ),
    async (c) => {
      const session_id = getCookie(c, "session_id");
      const project_id = crypto.randomUUID();
      const body = c.req.valid("json");
      await db(c).insert(projects).values([
        {
          id: project_id,
          name: body.name,
          description: body.description,
        },
      ]);
      if (!session_id) {
        const new_session_id = crypto.randomUUID();
        const account_id = crypto.randomUUID();
        await db(c).insert(accounts).values([
          {
            id: account_id,
            session_id: new_session_id,
            name: "anonymous",
          },
        ]);
        await db(c).insert(participants).values([
          {
            id: crypto.randomUUID(),
            account_id: account_id,
            project_id: project_id,
            is_admin: 1,
          },
        ]);
        setCookie(c, "session_id", new_session_id);
      } else {
        const account_resp = await db(c).select().from(accounts).where(eq(accounts.session_id, session_id));
        await db(c).insert(participants).values([
          {
            id: crypto.randomUUID(),
            account_id: account_resp[0].id,
            project_id: project_id,
            is_admin: 1,
          },
        ]);
      }

      await db(c).insert(roles).values(
        body.roles.map((r) => ({
          id: crypto.randomUUID(),
          name: r.name,
          min: r.min,
          max: r.max,
          project_id: project_id,
        })),
      );
      return c.json({
        id: project_id,
        name: body.name,
        description: body.description,
        role: body.roles,
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
      const session_id = getCookie(c, "session_id");
      if (!session_id) {
        console.log("session_id not found");
        return c.json({ message: "Unauthorized" }, 401);
      }
      const account_resp = await db(c).select().from(accounts).where(eq(accounts.session_id, session_id));
      if (account_resp.length === 0) {
        console.log("account not found");
        return c.json({ message: "Unauthorized" }, 401);
      }
      const participant_resp = await db(c).select().from(participants)
        .where(
          eq(participants.account_id, account_resp[0].id) && eq(participants.project_id, c.req.param("projectId")),
        );
      if (participant_resp.length === 0 || participant_resp[0].is_admin === 0) {
        console.log("participant not found or not admin");
        return c.json({ message: "Unauthorized" }, 401);
      }

      await db(c).update(projects).set({
        closed_at: new Date().toISOString(),
      }).where(eq(projects.id, c.req.param("projectId")));

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
      await db(c).insert(ratings).values(
        body.ratings.map((r) => ({
          id: crypto.randomUUID(),
          participant_id: participant_id,
          role_id: r.roleId,
          score: r.score,
          project_id: c.req.param("projectId"),
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
      const match_result = await db(c).select().from(matches).where(eq(matches.project_id, c.req.param("projectId")));
      return c.json(match_result);
    },
  );

export default route;
