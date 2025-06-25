import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db/client.ts";
import { Admins } from "../../db/schema.ts";
import { getBrowserID } from "./index.ts";

export async function isAdmin(c: Context, projectId: string) {
  const browserId = await getBrowserID(c);
  const admin = await db(c)
    .select()
    .from(Admins)
    .where(
      and(eq(Admins.browserId, browserId), eq(Admins.projectId, projectId)),
    )
    .limit(1);

  return admin.length > 0;
}
