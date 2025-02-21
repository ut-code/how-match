import { error } from "@sveltejs/kit";
import { client } from "~/api/client.ts";

async function getProject(projectId: string) {
  const response = await client.projects[":projectId"].$get({
    param: { projectId: projectId },
  });
  if (!response.ok) {
    return null;
  }
  return await response.json();
}

export const load = async ({ params }) => {
  if (params.projectId) {
    const project = await getProject(params.projectId);
    if (project) {
      return { project };
    }
  }
  error(404, "Not found");
};
