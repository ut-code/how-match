import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db/client.ts";
import { Participants } from "../../db/schema.ts";
import { getBrowserID } from "./index.ts";

export async function isAdmin(c: Context, projectId: string) {
  const browserId = await getBrowserID(c);
  const admin = await db(c)
    .select({
      id: Participants.id,
    })
    .from(Participants)
    .where(
      and(
        eq(Participants.projectId, projectId),
        eq(Participants.browserId, browserId),
        eq(Participants.isAdmin, 1),
      ),
    )
    .limit(1);

  console.log(admin);
  return admin.length > 0;
}
