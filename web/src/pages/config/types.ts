import type { SelectParticipant } from "service/db/schema";
import type { RoleWithId, SelectProject } from "share/schema";

export type Preferences = Record<`${string}->scored->${string}`, number>; // ${participant id}->scored->${role id} : number
// TODO: someone deduplicate this mess please
export type PageData = {
  projectId: string;
  project: SelectProject;
  participants: Omit<SelectParticipant, "projectId" | "browserId">[];
  roles: RoleWithId[];
  preferences?: Preferences;
  prev:
    | {
        id: string;
        name: string;
        rolesCount: number;
        isAdmin: number;
      }
    | undefined;
};

export const toPreferences = (
  preferences:
    | { participantId: string; roleId: string; score: number }[]
    | undefined,
): Preferences | undefined => {
  if (!preferences) return undefined;
  const result: Preferences = {};
  for (const preference of preferences) {
    result[`${preference.participantId}->scored->${preference.roleId}`] =
      preference.score;
  }
  return result;
};

export type Actions = {
  updateProject: (
    projectId: string,
    name: string,
    description: string | null,
    options?: {
      dropTooManyRoles?: boolean;
      multipleRoles?: boolean;
    },
  ) => Promise<void>;
  close: (projectId: string) => Promise<void>;
  reopen: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
};
