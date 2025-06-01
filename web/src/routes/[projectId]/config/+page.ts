import { error } from "@sveltejs/kit";
import { type Client, createClient } from "~/api/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  const projectId = params.projectId;
  if (!projectId) error(404, "not found");
  const client: Client = createClient({ fetch });
  const project = client.projects[":projectId"]
    .$get({
      param: {
        projectId,
      },
    })
    .then(async (res) => {
      if (!res.ok) error(res.status, await res.text());
      return await res.json();
    });
  const participants = client.projects[":projectId"].participants
    .$get({
      param: {
        projectId,
      },
    })
    .then((it) => it.json());

  const data = {
    projectId,
    ...(await project),
    participants: await participants,
  };
  return data;
};
