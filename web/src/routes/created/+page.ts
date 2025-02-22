// +page.ts
import { client } from "~/api/client";
import type { PageLoad } from "./$types.ts";
import { redirect } from "@sveltejs/kit";

async function validateProjectId(projectId: string) {
  const response = await client.projects[":projectId"].$get({ param: { projectId } });
  return response.ok ? projectId : null;
}

export const load: PageLoad = async ({ url }) => {
  const projectId = url.searchParams.get("projectId");
  if (!projectId) redirect(303, "/");
  const validProjectId = await validateProjectId(projectId);
  if (!validProjectId) redirect(303, "/");
  return { projectId: validProjectId };
};
