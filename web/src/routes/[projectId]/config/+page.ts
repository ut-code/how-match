import { error } from "@sveltejs/kit";
import { Client } from "~/data/client.ts";
import { type PageData, toPreferences } from "~/pages/config/types.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  const projectId = params.projectId;
  if (!projectId) error(404, "not found");

  const client = new Client(fetch);
  const project = await client.getProject(projectId);
  const participants = await client.getParticipants(projectId);
  const preferences = await client.getPreferences(projectId);

  const data: PageData = {
    projectId,
    ...project,
    roles: project.project.roles,
    participants,
    preferences: toPreferences(preferences),
  };
  return data;
};
