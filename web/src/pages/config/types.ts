import type { SelectParticipant, SelectProject } from "service/db/schema";

// TODO: someone deduplicate this mess please
export type PageData = {
  projectId: string;
  project: SelectProject;
  participants: Omit<SelectParticipant, "projectId" | "browserId">[];
  roles: {
    id: string;
    name: string;
    min: number;
    max: number;
    prev: number | null;
  }[];
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
      dropTooManyRoles?: number;
    },
  ) => Promise<void>;
  close: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
};
