import { error } from "@sveltejs/kit";
import { type Client, createClient } from "~/api/client.ts";
import { type PageData, toPreferences } from "~/pages/config/types.ts";
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

  const preferences = client.projects[":projectId"].preferences
    .$get({
      param: {
        projectId,
      },
    })
    .then((it) => (it.ok ? it.json() : undefined));

  const data: PageData = {
    projectId,
    ...(await project),
    roles: (await project).project.roles,
    participants: await participants,
    preferences: toPreferences(await preferences),
  };
  return data;
};
