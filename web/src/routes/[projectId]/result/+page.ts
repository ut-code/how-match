import { error } from "@sveltejs/kit";
import { Client } from "~/data/client.ts";
import type { PageLoad } from "./$types.ts";

export const load: PageLoad = async ({ params, fetch }) => {
  if (!params.projectId) error(404, "not found");
  const client = new Client(fetch);
  const result = await client.getResult(params.projectId);
  const roles = await client.getRoles(params.projectId);
  const participants = await client.getParticipants(params.projectId);

  return {
    projectId: params.projectId,
    roles,
    result,
    participants,
  };
};
