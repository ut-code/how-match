import type {
  SelectMatch,
  SelectParticipants,
  SelectProject,
  SelectRole,
} from "share/schema.ts";

export const mockRoles: SelectRole[] = [
  {
    id: "1-match",
    max: 5,
    min: 0,
    name: "How Match",
    projectId: "2025-winter",
  },
  {
    id: "2-bridge",
    max: 4,
    min: 0,
    name: "UT-Bridge",
    projectId: "2025-winter",
  },
  {
    id: "3-nba",
    max: 2,
    min: 0,
    name: "Node Base Audio",
    projectId: "2025-winter",
  },
  {
    id: "4-cg",
    max: 2,
    min: 0,
    name: "Create CG",
    projectId: "2025-winter",
  },
];

export const mockProjects: SelectProject[] = [
  {
    id: "2025-spring",
    name: "2025年春プロジェクト発足回",
    multipleRoles: true,
    dropTooManyRoles: false,
    description: null,
    closedAt: null,
  },
  // 他の Mock はこれ (2025-winter) 用に作られてる。
  {
    id: "2025-winter",
    name: "2025年冬プロジェクト発足回",
    multipleRoles: true,
    dropTooManyRoles: false,
    description: null,
    closedAt: null,
  },
  {
    id: "2024-winter",
    name: "2024年冬大忘年会",
    multipleRoles: true,
    dropTooManyRoles: false,
    description: null,
    closedAt: null,
  },
];

export const mockParticipants: SelectParticipants = [
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
export const mockRatings: SelectRole[] = [];
export const mockMatches: SelectMatch[] = [];
