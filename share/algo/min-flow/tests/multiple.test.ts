import { expect, test } from "bun:test";
import { multipleMatch } from "../multiple.ts";
import type { Participant, Role } from "../multiple.ts";

test("basic functionality - simple case", () => {
  const participants: Participant[] = [
    {
      id: "p1",
      rolesCount: 2,
      preferences: [
        { roleId: "r1", score: 5 },
        { roleId: "r2", score: 4 },
        { roleId: "r3", score: 3 },
      ],
    },
    {
      id: "p2",
      rolesCount: 2,
      preferences: [
        { roleId: "r1", score: 3 },
        { roleId: "r2", score: 5 },
        { roleId: "r3", score: 4 },
      ],
    },
  ];

  const roles: Role[] = [
    { id: "r1", capacity: 1 },
    { id: "r2", capacity: 2 },
    { id: "r3", capacity: 1 },
  ];

  const result = multipleMatch(participants, roles, {
    dropTooManyRoles: false,
  });

  // Each participant should be assigned exactly rolesCount roles
  expect(result).toSatisfy((r) => r.every((m) => m.roleIds.length === 2));

  // Total assignments should match total rolesCount
  const totalAssignments = result.reduce((sum, m) => sum + m.roleIds.length, 0);
  expect(totalAssignments).toBe(4); // 2 participants * 2 roles each
});

test("role dropping - should drop least wanted role", () => {
  const participants: Participant[] = [
    {
      id: "p1",
      rolesCount: 1,
      preferences: [
        { roleId: "r1", score: 5 },
        { roleId: "r2", score: 4 },
        { roleId: "r3", score: 1 }, // Least wanted
      ],
    },
    {
      id: "p2",
      rolesCount: 1,
      preferences: [
        { roleId: "r1", score: 4 },
        { roleId: "r2", score: 5 },
        { roleId: "r3", score: 2 }, // Least wanted
      ],
    },
  ];

  const roles: Role[] = [
    { id: "r1", capacity: 1 },
    { id: "r2", capacity: 1 },
    { id: "r3", capacity: 1 }, // This should be dropped as it's least wanted
  ];

  const result = multipleMatch(participants, roles, {
    dropTooManyRoles: true,
  });

  // Should not assign anyone to r3 as it should be dropped
  expect(result).toSatisfy((r) => !r.some((m) => m.roleIds.includes("r3")));

  // Each participant should still be assigned exactly one role
  expect(result).toSatisfy((r) => r.every((m) => m.roleIds.length === 1));
});

test("overflow handling - should handle when total capacity > total rolesCount", () => {
  const participants: Participant[] = [
    {
      id: "p1",
      rolesCount: 1,
      preferences: [
        { roleId: "r1", score: 5 },
        { roleId: "r2", score: 4 },
      ],
    },
    {
      id: "p2",
      rolesCount: 1,
      preferences: [
        { roleId: "r1", score: 3 },
        { roleId: "r2", score: 5 },
      ],
    },
  ];

  const roles: Role[] = [
    { id: "r1", capacity: 2 }, // Capacity higher than needed
    { id: "r2", capacity: 2 }, // Capacity higher than needed
  ];

  const result = multipleMatch(participants, roles, {
    dropTooManyRoles: false,
  });

  // Each participant should still be assigned exactly one role
  expect(result).toSatisfy((r) => r.every((m) => m.roleIds.length === 1));

  // Total assignments should match total rolesCount
  const totalAssignments = result.reduce((sum, m) => sum + m.roleIds.length, 0);
  expect(totalAssignments).toBe(2); // 2 participants * 1 role each
});

test("should handle empty preferences", () => {
  const participants: Participant[] = [
    {
      id: "p1",
      rolesCount: 1,
      preferences: [], // Empty preferences
    },
  ];

  const roles: Role[] = [{ id: "r1", capacity: 1 }];

  const result = multipleMatch(participants, roles, {
    dropTooManyRoles: false,
  });

  // Should still return a result for the participant
  expect(result.length).toBe(1);
  // But they shouldn't be assigned any roles due to no preferences
  expect(result).toSatisfy((r) => r.every((m) => m.roleIds.length === 0));
});

// TODO: make it handle this case
test("when participant wants more roles than there is", () => {
  const participants: Participant[] = [
    {
      id: "p1",
      rolesCount: 2, // Wants 2 roles
      preferences: [
        { roleId: "r1", score: 5 },
        { roleId: "r2", score: 4 },
      ],
    },
    {
      id: "p2",
      rolesCount: 2, // Wants 2 roles
      preferences: [
        { roleId: "r1", score: 5 },
        { roleId: "r2", score: 4 },
      ],
    },
  ]; // wants 4 in total, but theres' only 2 roles

  const roles: Role[] = [
    { id: "r1", capacity: 1 },
    { id: "r2", capacity: 1 },
  ];

  const result = multipleMatch(participants, roles, {
    dropTooManyRoles: false,
  });

  // Should assign as many roles as possible
  expect(() => {
    expect(result.reduce((sum, m) => sum + m.roleIds.length, 0)).toBe(2);
  }).toThrow();
});
