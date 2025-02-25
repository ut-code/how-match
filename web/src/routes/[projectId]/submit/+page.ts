import { error } from "@sveltejs/kit";
import { createClient } from "~/api/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  const client = createClient({ fetch });
  const res = await client.projects[":projectId"].$get({
    param: { projectId: params.projectId },
  });
  const data = await res.json();
  if (!data.project) error(404, "Not found");

  return data;
};
