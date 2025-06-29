import { randomInt } from "share/lib";
import type { Ratings, SelectAdmins, SelectRole } from "share/schema";
import type { Actions, PageData } from "~/pages/config/types.ts";

const projectId = "project-1";
export const mockData: (props: { isAdmin: boolean }) => PageData = ({
  isAdmin,
}): PageData => {
  const roles: SelectRole[] = [
    {
      id: "role1",
      name: "Frontend Developer",
      min: 2,
      max: 4,
      projectId,
    },
    {
      id: "role2",
      name: "Backend Developer",
      min: 1,
      max: 3,
      projectId,
    },
    {
      id: "role3",
      name: "UI/UX Designer",
      min: 1,
      max: 2,
      projectId,
    },
    {
      id: "role4",
      name: "Project Manager",
      min: 1,
      max: 1,
      projectId,
    },
  ];

  const participants = [
    {
      id: "user1",
      name: "John Doe",
      rolesCount: 2,
    },
    {
      id: "user-you",
      name: "You",
      rolesCount: 1,
    },
    {
      id: "user3",
      name: "Bob Wilson",
      rolesCount: 2,
    },
  ];
  const admins: SelectAdmins = [
    {
      id: "user1",
      name: "John Doe",
      browserId: "user1",
    },
    ...(isAdmin
      ? [{ id: "user-you", name: "You", browserId: "user-you" }]
      : []),
  ];

  const preferences = createRandomPreferences(participants, roles);

  return {
    projectId,
    project: {
      id: projectId,
      name: "Project 1",
      description: "Description 1",
      multipleRoles: true,
      dropTooManyRoles: true,
      closedAt: null,
    },
    roles,
    participants,
    admin: isAdmin ? { preferences } : undefined,
    admins,
    prev: {
      submission: {
        id: "user-you",
        name: "You",
        rolesCount: 2,
        isAdmin,
      },
      ratings: preferences["user-you"],
    },
  };
};

export const mockActions: Actions = {
  updateProject: async (projectId, name, description, options) => {
    console.log("updateProject", projectId, name, description, options);
    await Promise.resolve();
  },
  close: async (projectId) => {
    console.log("close", projectId);
    await Promise.resolve();
  },
  deleteProject: async (projectId) => {
    console.log("deleteProject", projectId);
    await Promise.resolve();
  },
  reopen: async (projectId) => {
    console.log("reopen", projectId);
    await Promise.resolve();
  },
};

export function createRandomPreferences(
  participants: { id: string; name: string }[],
  roles: SelectRole[],
): Record<string, Ratings> {
  return Object.fromEntries(
    participants.map((p) => [
      p.id,
      Object.fromEntries(roles.map((r) => [r.id, randomInt(1, 6)])),
    ]),
  );
}
