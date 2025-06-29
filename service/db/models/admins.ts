import { eq } from "drizzle-orm";
import type { Context } from "hono";
import type { SelectAdmins } from "share/schema.ts";
import type { HonoOptions } from "../../types.ts";
import { db } from "../client.ts";
import { Admins } from "../schema.ts";

export async function getAdmins(
  c: Context<HonoOptions>,
  projectId: string,
): Promise<SelectAdmins> {
  const admins = await db(c)
    .select()
    .from(Admins)
    .where(eq(Admins.projectId, projectId));

  return admins;
}

export async function addAdmin(
  c: Context<HonoOptions>,
  projectId: string,
  userId: string,
  name: string,
) {
  await db(c).insert(Admins).values({
    id: crypto.randomUUID(),
    name,
    projectId,
    userId,
  });
}
