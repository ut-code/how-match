import { and, count, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "service/db/client";
import { Participants, Ratings, Roles } from "service/db/schema.ts";
import { getBrowserID } from "service/features/auth/index.ts";
import type { HonoOptions } from "service/types";
import { json, param } from "service/validator/hono.ts";
import { Preference } from "share/schema";
import * as v from "valibot";
import { isAdmin } from "../../features/auth/rules.ts";

const route = new Hono<HonoOptions>()
  .post(
    "/",
    json(Preference),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browserId = await getBrowserID(c);
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");

      const participantResult = await db(c)
        .select()
        .from(Participants)
        .where(
          and(
            eq(Participants.browserId, browserId),
            eq(Participants.projectId, projectId),
          ),
        )
        .limit(1);

      if (participantResult.length > 0) {
        throw new HTTPException(409, { message: "すでに希望を提出済です" });
      }

      const participant = (
        await db(c)
          .insert(Participants)
          .values({
            id: crypto.randomUUID(),
            name: body.participantName,
            browserId: browserId,
            projectId: projectId,
            isAdmin: 0,
            rolesCount: body.rolesCount,
          })
          .returning()
      )[0];
      if (!participant)
        throw new HTTPException(500, {
          message: "failed to insert participant",
        });

      // HACK: Cloudflare cannot handle too many SQL variables
      // see more here: <https://zenn.dev/motoi/scraps/92309135b74618>
      await Promise.all(
        body.ratings
          .map((r) => ({
            id: crypto.randomUUID(),
            name: body.participantName,
            participantId: participant.id,
            roleId: r.roleId,
            score: r.score,
            projectId: projectId,
          }))
          .map(async (dataRow) => {
            return await db(c).insert(Ratings).values(dataRow);
          }),
      );
      return c.json({ ok: true }, 201);
    },
  )
  .put(
    "/",
    json(Preference),
    param({
      projectId: v.string(),
    }),
    async (c) => {
      const browserId = await getBrowserID(c);
      const { projectId } = c.req.valid("param");
      const body = c.req.valid("json");

      const d = db(c);

      // this will always be .length = 1
      const project = await d
        .select({ rolesLen: count() })
        .from(Roles)
        .where(eq(Roles.projectId, projectId));
      if (body.rolesCount > (project[0]?.rolesLen ?? 0)) {
        throw new HTTPException(409, {
          message: "you sent more count than there is role",
        });
      }

      const participant = (
        await db(c)
          .update(Participants)
          .set({
            name: body.participantName,
            rolesCount: body.rolesCount,
          })
          .where(and(eq(Participants.browserId, browserId)))
          .returning({ id: Participants.id })
      )[0];
      if (!participant)
        throw new HTTPException(500, { message: "failed to find participant" });

      await db(c)
        .delete(Ratings)
        .where(eq(Ratings.participantId, participant.id));

      // HACK: Cloudflare cannot handle too many SQL variables
      // see more here: <https://zenn.dev/motoi/scraps/92309135b74618>
      await Promise.all(
        body.ratings
          .map((r) => ({
            id: crypto.randomUUID(),
            name: body.participantName,
            participantId: participant.id,
            roleId: r.roleId,
            score: r.score,
            projectId: projectId,
          }))
          .map(async (dataRow) => {
            return await db(c).insert(Ratings).values(dataRow);
          }),
      );
      return c.json({ ok: true }, 200);
    },
  )
  .get("/", param({ projectId: v.string() }), async (c) => {
    const { projectId } = c.req.valid("param");
    if (!isAdmin(c, projectId)) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const d = db(c);
    const preferences = await d
      .select({
        participantId: Participants.id,
        roleId: Roles.id,
        score: Ratings.score,
      })
      .from(Participants)
      .innerJoin(Ratings, eq(Participants.id, Ratings.participantId))
      .innerJoin(Roles, eq(Roles.id, Ratings.roleId))
      .where(eq(Participants.projectId, projectId));
    return c.json(preferences);
  });

export default route;
