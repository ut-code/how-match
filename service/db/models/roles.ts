import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import type { HonoOptions } from "service/types";
import { db, preparedQueries } from "../client.ts";
import { Roles } from "../schema.ts";

export function getRoles(c: Context<HonoOptions>, projectId: string) {
  return preparedQueries(c).getRolesByProject.execute({ projectId });
}

type Patches = {
  create?: Role[];
  update?: RoleWithId[];
  delete?: string[];
};
export async function applyPatchesToRoles(
  c: Context<HonoOptions>,
  projectId: string,
  patches: Patches,
) {
  const d = db(c);

  if (patches.create && patches.create.length > 0) {
    // TODO: batch insert (wait for cloudflare fix)
    await Promise.all(
      patches.create.map((role) => {
        return d.insert(Roles).values({
          ...role,
          id: crypto.randomUUID(),
          projectId,
        });
      }),
    );
  }
  if (patches.update && patches.update.length > 0) {
    for (const role of patches.update) {
      await d
        .update(Roles)
        .set({ ...role, id: undefined })
        .where(and(eq(Roles.id, role.id), eq(Roles.projectId, projectId)));
    }
  }
  if (patches.delete && patches.delete.length > 0) {
    for (const role of patches.delete) {
      await d
        .delete(Roles)
        .where(and(eq(Roles.id, role), eq(Roles.projectId, projectId)));
    }
  }
}
