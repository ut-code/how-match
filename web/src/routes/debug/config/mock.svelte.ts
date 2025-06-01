import type { Actions, PageData } from "~/pages/config/types.ts";

export const mockData: (props: { isAdmin: boolean }) => PageData = ({
  isAdmin,
}) => ({
  projectId: "1",
  project: {
    id: "1",
    name: "Project 1",
    description: "Description 1",
    multipleRoles: 3,
    closedAt: null,
    dropTooManyRoles: 2,
  },
  participants: [
    {
      id: "user1",
      name: "John Doe",
      rolesCount: 2,
      isAdmin: 1,
    },
    {
      id: "user-you",
      name: "You",
      rolesCount: 1,
      isAdmin: 0,
    },
    {
      id: "user3",
      name: "Bob Wilson",
      rolesCount: 2,
      isAdmin: 0,
    },
  ],
  roles: [
    {
      id: "role1",
      name: "Frontend Developer",
      min: 2,
      max: 4,
      prev: 2,
    },
    {
      id: "role2",
      name: "Backend Developer",
      min: 1,
      max: 3,
      prev: 1,
    },
    {
      id: "role3",
      name: "UI/UX Designer",
      min: 1,
      max: 2,
      prev: 1,
    },
    {
      id: "role4",
      name: "Project Manager",
      min: 1,
      max: 1,
      prev: 1,
    },
  ],
  prev: {
    id: "user-you",
    name: "You",
    rolesCount: 2,
    isAdmin: isAdmin ? 1 : 0,
  },
});

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
};
