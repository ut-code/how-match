import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { db } from "../../db/client.ts";
import { Admins } from "../../db/schema.ts";
import { getCurrentUserId } from "./index.ts";

export async function isAdmin(c: Context, projectId: string) {
  const userId = await getCurrentUserId(c);
  if (!userId) return false;

  const admin = await db(c)
    .select()
    .from(Admins)
    .where(and(eq(Admins.userId, userId), eq(Admins.projectId, projectId)))
    .limit(1);

  return admin.length > 0;
}
