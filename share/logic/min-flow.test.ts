import { expect, test } from "bun:test";
import { assignRoles } from "./min-flow.ts";

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
  console.log(got);

  expect(got).toEqual(expected);
});
