import { db } from "../db/client.ts";
import { accounts, matches, participants, projects, ratings, roles } from "../db/schema.ts";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import * as v from "valibot";
import { HTTPException } from "hono/http-exception";
import type { HonoOptions } from "../types.ts";
import { json, param } from "../validator/hono.ts";
import { PreferenceSchema, ProjectSchema } from "../validator/schemas.ts";

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
      const browser_id = getCookie(c, "browser_id");
      const project_id = crypto.randomUUID();
      const body = c.req.valid("json");
      await db(c)
        .insert(projects)
        .values([
          {
            id: project_id,
            name: body.name,
            description: body.description,
          },
        ]);
      if (browser_id) {
        const account_resp = await db(c)
          .select()
          .from(accounts)
          .where(eq(accounts.browser_id, browser_id));
        await db(c)
          .insert(participants)
          .values([
            {
              id: crypto.randomUUID(),
              name: "anonymous admin",
              account_id: account_resp[0].id,
              project_id: project_id,
              is_admin: 1,
            },
          ]);
      } else {
        const new_browser_id = crypto.randomUUID();
        const account_id = crypto.randomUUID();
        await db(c)
          .insert(accounts)
          .values([
            {
              id: account_id,
              browser_id: new_browser_id,
              name: "anonymous",
            },
          ]);
        await db(c)
          .insert(participants)
          .values([
            {
              id: crypto.randomUUID(),
              name: "anonymous admin",
              account_id: account_id,
              project_id: project_id,
              is_admin: 1,
            },
          ]);
        setCookie(c, "browser_id", new_browser_id);
      }

      await db(c)
        .insert(roles)
        .values(
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
        roles: body.roles,
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
      const browserId = getCookie(c, "browser_id");
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

      if (browserId) {
        // TODO: findUnique をしたい感じ。もう少しうまくやりたい
        const accountsResult = await db(c)
          .select()
          .from(accounts)
          .where(eq(accounts.browser_id, browserId))
          .limit(1);
        if (accountsResult.length === 0) {
          return c.json({ message: "Unauthorized" }, 401);
        }
        const account = accountsResult[0];

        const participantResult = await db(c)
          .select()
          .from(participants)
          .where(
            eq(participants.account_id, accountsResult[0].id) &&
              eq(participants.project_id, projectId),
          )
          .limit(1);

        if (participantResult.length !== 0) {
          // TODO: 管理者も参加者として希望を出す場合には未対応
          return c.json({ message: "すでに希望を提出済です" }, 400);
        }

        await db(c).transaction(async (tx) => {
          const participant = (
            await tx
              .insert(participants)
              .values({
                id: crypto.randomUUID(),
                name: body.participantName,
                account_id: account.id,
                project_id: projectId,
                is_admin: 0,
              })
              .returning()
          )[0];

          await tx.insert(ratings).values(
            body.ratings.map((r) => ({
              id: crypto.randomUUID(),
              name: body.participantName,
              participant_id: participant.id,
              role_id: r.roleId,
              score: r.score,
              project_id: projectId,
            })),
          );
          return c.json({}, 201);
        });
      } else {
        await db(c).transaction(async (tx) => {
          const account = (
            await tx
              .insert(accounts)
              .values({
                id: crypto.randomUUID(),
                browser_id: crypto.randomUUID(),
                name: "anonymous",
              })
              .returning()
          )[0];

          const participant = (
            await tx
              .insert(participants)
              .values({
                id: crypto.randomUUID(),
                name: body.participantName,
                account_id: account.id,
                project_id: projectId,
                is_admin: 0,
              })
              .returning()
          )[0];

          await tx.insert(ratings).values(
            body.ratings.map((r) => ({
              id: crypto.randomUUID(),
              participant_id: participant.id,
              role_id: r.roleId,
              score: r.score,
              project_id: projectId,
            })),
          );
          setCookie(c, "browser_id", account.browser_id);
        });
        return c.json({}, 201);
      }
    },
  )
  //     await db(c).insert(participants).values(
  //       {
  //         id: participant_id,
  //         account_id: body.accountId ?? new_account_id,
  //         project_id: projectId,
  //         is_admin: 0,
  //       },
  //     );
  //     return c.json({}, 201);
  //   },
  // )
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
