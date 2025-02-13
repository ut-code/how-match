import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = ({ params }) => {
  if (params.projectId) {
    return {
      projectId: params.projectId,
    };
  }

  error(404, "Not found");
};
