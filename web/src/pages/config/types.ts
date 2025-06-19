import type { SelectParticipant } from "service/db/schema";
import type { SelectProject } from "share/schema";

// TODO: someone deduplicate this mess please
export type PageData = {
  projectId: string;
  project: SelectProject;
  participants: Omit<SelectParticipant, "projectId" | "browserId">[];
  prev:
    | {
        id: string;
        name: string;
        rolesCount: number;
        isAdmin: number;
      }
    | undefined;
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
