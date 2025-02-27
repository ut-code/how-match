import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "service/db/client";
import { participants, ratings } from "service/db/schema.ts";
import { getBrowserID } from "service/features/auth/index.ts";
import type { HonoOptions } from "service/types";
import { json, param } from "service/validator/hono.ts";
import { PreferenceSchema } from "share/schema";
import * as v from "valibot";

const route = new Hono<HonoOptions>()
  .post(
    "/",
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
        throw new HTTPException(409, { message: "すでに希望を提出済です" });
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

      await db(c)
        .insert(ratings)
        .values(
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
  .put(
    "/",
    json(PreferenceSchema),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browser_id = await getBrowserID(c);
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");
      const participant = (
        await db(c)
          .update(participants)
          .set({
            name: body.participantName,
          })
          .where(eq(participants.browser_id, browser_id))
          .returning({ id: participants.id })
      )[0];
      if (!participant) throw new HTTPException(500, { message: "failed to find participant" });

      await db(c).delete(ratings).where(eq(ratings.participant_id, participant.id));
      await db(c)
        .insert(ratings)
        .values(
          body.ratings.map((r) => ({
            id: crypto.randomUUID(),
            name: body.participantName,
            participant_id: participant.id,
            role_id: r.roleId,
            score: r.score,
            project_id: projectId,
          })),
        );
      return c.json({ ok: true }, 200);
    },
  );
export default route;
