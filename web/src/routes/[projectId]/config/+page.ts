import { error } from "@sveltejs/kit";
import { type Client, createClient } from "~/api/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = ({ params, fetch }) => {
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
      if (res.ok) return { ok: true, data: await res.json() } as const;
      return {
        ok: false,
        code: res.status,
        message: await res.text(),
      } as const;
    });
  const participants = client.projects[":projectId"].participants
    .$get({
      param: {
        projectId,
      },
    })
    .then((it) => it.json());

  return {
    projectId,
    project,
    participants,
  };
};
