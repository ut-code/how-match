import type {
  SelectMatch,
  SelectParticipant,
  SelectProject,
  SelectRole,
} from "service/db/schema";

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
const shareProjectConfig = {
  multipleRoles: 1,
  dropTooManyRoles: 0,
};
export const mockProjects: SelectProject[] = [
  {
    id: "2025-spring",
    name: "2025年春プロジェクト発足回",
    multipleRoles: shareProjectConfig.multipleRoles,
    dropTooManyRoles: shareProjectConfig.dropTooManyRoles,
    description: null,
    closedAt: null,
  },
  // 他の Mock はこれ (2025-winter) 用に作られてる。
  {
    id: "2025-winter",
    name: "2025年冬プロジェクト発足回",
    multipleRoles: shareProjectConfig.multipleRoles,
    dropTooManyRoles: shareProjectConfig.dropTooManyRoles,
    description: null,
    closedAt: null,
  },
  {
    id: "2024-winter",
    name: "2024年冬大忘年会",
    multipleRoles: shareProjectConfig.multipleRoles,
    dropTooManyRoles: shareProjectConfig.dropTooManyRoles,
    description: null,
    closedAt: null,
  },
];

export const mockParticipants: SelectParticipant[] = [];
export const mockRatings: SelectRole[] = [];
export const mockMatches: SelectMatch[] = [];
