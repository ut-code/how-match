import { error } from "@sveltejs/kit";
import { type Client, createClient } from "~/api/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = ({ params, fetch }) => {
  if (!params.projectId) error(404, "not found");
  const client: Client = createClient({ fetch });
  const stream = client.projects[":projectId"]
    .$get({
      param: {
        projectId: params.projectId,
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

  return {
    projectId: params.projectId,
    stream,
  };
};
