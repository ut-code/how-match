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
