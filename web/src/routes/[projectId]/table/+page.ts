import { error } from "@sveltejs/kit";
import { Client } from "~/data";
import type { PageData, PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const projectId = params.projectId;
  if (!projectId) error(404, "not found");

  const client = new Client(fetch);
  const { project, roles } = await client.getProject(projectId);
  const allPreferences = await client.getAllPreferences(projectId);
  const participants = await client.getParticipants(projectId);

  const data: PageData = {
    project,
    roles,
    participants,
    preferences: allPreferences?.ratings,
  };
  return data;
};
