import type {
  Ratings,
  SelectAdmins,
  SelectParticipants,
  SelectProject,
  SelectRole,
} from "share/schema";

export type PageData = {
  projectId: string;
  project: SelectProject;
  participants: SelectParticipants;
  admins: SelectAdmins;
  roles: SelectRole[];
  admin?: {
    preferences?: Record<string, Ratings>;
  };
  prev:
    | {
        submission?: {
          id: string;
          name: string;
          rolesCount: number;
          isAdmin: boolean;
        };
        ratings?: Ratings;
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
