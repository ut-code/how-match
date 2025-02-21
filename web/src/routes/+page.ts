import { client } from "~/api/client.ts";

async function getMyProjects() {
  const response = await client.projects.mine.$get();
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export const load = async () => {
  const projects = await getMyProjects();
  if (projects) {
    return { projects };
  }
  return { projects: null };
};
