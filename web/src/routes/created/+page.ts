// +page.ts
import { client } from "~/api/client";
import type { PageLoad } from "./$types.ts";

async function validateProjectId(projectId: string) {
  const response = await client.projects[":projectId"].$get({ param: { projectId } });
  return response.ok ? projectId : null;
}

export const load: PageLoad = async ({ url }) => {
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return null;
  const validProjectId = await validateProjectId(projectId);
  return { projectId: validProjectId };
};
