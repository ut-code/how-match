// +page.ts
import { client } from "~/api/client";
import type { PageLoad } from "./$types.ts";
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = async ({ url }) => {
  const projectId = url.searchParams.get("projectId");
  if (!projectId) redirect(303, "/");
  if ((await client.projects[":projectId"].$get({ param: { projectId } })).ok) {
    return { projectId };
  }
  redirect(303, "/");
};
