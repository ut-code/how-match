import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types.ts";
import { client } from "~/api/client.ts";

export const load: PageLoad = ({ params }) => {
  if (params.projectId) {
    const projectId = params.projectId;
    const project = client.projects[":projectId"].$get({
      param: {
        projectId,
      },
    }).then((it) => it.json());

    return {
      projectId,
      project,
    };
  }

  error(404, "Not found");
};
