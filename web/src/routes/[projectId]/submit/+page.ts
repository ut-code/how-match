import { Client } from "~/data/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  const projectId = params.projectId;
  const client = new Client(fetch);
  const data = await client.getProject(projectId);

  return data;
};
