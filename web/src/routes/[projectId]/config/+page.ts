import { error } from "@sveltejs/kit";
import { Client } from "~/data/client.ts";
import type { PageData } from "~/pages/config/types.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  const projectId = params.projectId;
  if (!projectId) error(404, "not found");

  const client = new Client(fetch);
  const { project, roles } = await client.getProject(projectId);
  const prev = await client.getPreviousSubmission(projectId);
  const allPreferences = await client.getAllPreferences(projectId);
  const participants = await client.getParticipants(projectId);
  const admins = await client.getAdmins(projectId);

  const data: PageData = {
    projectId,
    project,
    roles,
    participants,
    admins,
    admin: {
      preferences: allPreferences?.ratings,
    },
    prev,
  };
  return data;
};
