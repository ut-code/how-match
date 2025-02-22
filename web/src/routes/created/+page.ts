// +page.ts
import { type Client, createClient } from "~/api/client";
import type { PageLoad } from "./$types.ts";

async function validateProjectId(client: Client, projectId: string) {
  const response = await client.projects[":projectId"].$get({ param: { projectId } });
  return response.ok ? projectId : null;
}

export const load: PageLoad = async ({ url, fetch }) => {
  const projectId = url.searchParams.get("projectId");
  if (!projectId) return null;
  const validProjectId = await validateProjectId(createClient({ fetch }), projectId);
  return { projectId: validProjectId };
};
