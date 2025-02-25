import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types.ts";
import { type Client, createClient } from "~/api/client.ts";

export const load: PageLoad = ({ params, fetch }) => {
  if (!params.projectId) error(404, "not found");
  const client: Client = createClient({ fetch });
  const data = client.projects[":projectId"].$get({
    param: {
      projectId: params.projectId,
    },
  }).then((it) => it.json());

  return {
    projectId: params.projectId,
    data,
  };
};
