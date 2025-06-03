import { expect, it, test } from "bun:test";
import { assignRoles } from "../single.ts";

test("basic functionality - simple case", () => {
  const participants = [
    [5, 3], // P1's preferences for R1 and R2
    [3, 5], // P2's preferences for R1 and R2
  ];

  const roles = 2;
  const minMaxConstraints = [
    { min: 1, max: 1 }, // R1 constraints
    { min: 1, max: 1 }, // R2 constraints
  ];

  const result = assignRoles(participants, roles, minMaxConstraints);

  // Should assign P1 to R1 (score 5) and P2 to R2 (score 5) for optimal matching
  expect(result).toEqual([
    { participant: 0, role: 0 },
    { participant: 1, role: 1 },
  ]);
});

test("role constraints - should respect min/max", () => {
  const participants = [
    [5, 4, 3], // P1's preferences
    [4, 5, 3], // P2's preferences
    [3, 4, 5], // P3's preferences
  ];

  const roles = 3;
  const minMaxConstraints = [
    { min: 0, max: 1 }, // R1: at most 1
    { min: 1, max: 2 }, // R2: at least 1, at most 2
    { min: 1, max: 1 }, // R3: exactly 1
  ];

  const result = assignRoles(participants, roles, minMaxConstraints);

  // Count assignments per role
  const roleCounts = new Array(roles).fill(0);
  result.forEach(({ role }) => {
    if (role >= 0) roleCounts[role]++;
  });

  // Check constraints are met
  expect(roleCounts[0] <= 1).toBe(true); // R1: max 1
  expect(roleCounts[1] >= 1 && roleCounts[1] <= 2).toBe(true); // R2: between 1 and 2
  expect(roleCounts[2] === 1).toBe(true); // R3: exactly 1
});

test("should handle unassigned participants when capacity is insufficient", () => {
  const participants = [
    [5, 4], // P1's preferences
    [4, 5], // P2's preferences
    [3, 3], // P3's preferences - might be unassigned
  ];

  const roles = 2;
  const minMaxConstraints = [
    { min: 1, max: 1 }, // R1: exactly 1
    { min: 1, max: 1 }, // R2: exactly 1
  ];

  const result = assignRoles(participants, roles, minMaxConstraints);

  // Should have one participant unassigned (role = -1)
  expect(result.filter((r) => r.role === -1).length).toBe(1);

  // Should have exactly 2 assigned participants
  expect(result.filter((r) => r.role !== -1).length).toBe(2);
});

test("should optimize for maximum total score", () => {
  const participants = [
    [5, 2, 3], // P1's preferences
    [2, 5, 3], // P2's preferences
    [3, 3, 5], // P3's preferences
  ];

  const roles = 3;
  const minMaxConstraints = [
    { min: 1, max: 1 },
    { min: 1, max: 1 },
    { min: 1, max: 1 },
  ];

  const result = assignRoles(participants, roles, minMaxConstraints);

  // Calculate total score of the assignment
  let totalScore = 0;
  result.forEach(({ participant, role }) => {
    if (role >= 0) {
      totalScore += participants[participant][role];
    }
  });

  // The optimal assignment should give us 5 + 5 + 5 = 15
  expect(totalScore).toBe(15);
});

test("chatgpt-given example", () => {
  // **例**
  const participants = [
    [5, 4, 3, 2, 1], // P1 の希望 (R1, R2, R3, R4, R5)
    [2, 5, 3, 1, 4], // P2 の希望
    [3, 3, 5, 4, 2], // P3 の希望
    [4, 1, 2, 5, 3], // P4 の希望
    [1, 2, 4, 3, 5], // P5 の希望
    [5, 3, 2, 4, 1], // P6 の希望
    [4, 5, 1, 2, 3], // P7 の希望
    [3, 2, 4, 1, 5], // P8 の希望
    [2, 4, 3, 5, 1], // P9 の希望
    [1, 5, 4, 3, 2], // P10 の希望
  ];

  const roles = 5;
  const minMaxConstraints = [
    { min: 1, max: 3 }, // R1 の min/max
    { min: 2, max: 4 }, // R2 の min/max
    { min: 1, max: 3 }, // R3 の min/max
    { min: 2, max: 3 }, // R4 の min/max
    { min: 1, max: 2 }, // R5 の min/max
  ];
  const expected = [
    { participant: 0, role: 0 },
    { participant: 1, role: 1 },
    { participant: 2, role: 2 },
    { participant: 3, role: 3 },
    { participant: 4, role: 4 },
    { participant: 5, role: 0 },
    { participant: 6, role: 1 },
    { participant: 7, role: 4 },
    { participant: 8, role: 3 },
    { participant: 9, role: 1 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);

  expect(got).toEqual(expected);
});

it(
  "should run relatively fast even if the number of participants is large",
  () => {
    // TODO: increase these numbers to 100 / 50 for maximum in real world
    const plen = 50;
    const rlen = 5; // uhhh
    const participants = Array.from({ length: plen }, () =>
      Array.from({ length: rlen }, () => Math.floor(Math.random() * 5) + 1),
    );
    const roles = rlen;
    const minMaxConstraints = Array.from({ length: roles }, () => ({
      min: 1,
      max: 3,
    }));
    const start = performance.now();
    assignRoles(participants, roles, minMaxConstraints);
    const end = performance.now();
    const took = end - start;
    console.log(`[single] time: ${took}ms`);
    expect(took).toBeLessThan(10); // CF free tier has 10ms CPU time limit
  },
  {
    timeout: 10,
  },
);
