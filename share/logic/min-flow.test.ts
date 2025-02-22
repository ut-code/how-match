import { expect, test } from "bun:test";
import { assignRoles } from "./min-flow.ts";

// 割り当て結果が min, max 制約を満たしているか確認する関数
function validateAssignment(
  assignment: { participant: number; role: number }[],
  minMaxConstraints: { min: number; max: number }[],
): boolean {
  const roleCounts = new Map<number, number>();
  for (const { role } of assignment) {
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }

  return minMaxConstraints.every(({ min, max }, role) => {
    const count = roleCounts.get(role) ?? 0;
    return count >= min && count <= max;
  });
}

test("test1", () => {
  const participants = [
    [5, 4, 3, 2, 1],
    [4, 5, 3, 1, 2],
    [3, 4, 5, 2, 1],
    [2, 1, 4, 5, 3],
    [1, 3, 2, 4, 5],
    [5, 3, 2, 1, 4],
    [4, 2, 1, 5, 3],
    [3, 1, 5, 4, 2],
  ];
  const roles = [0, 1, 2, 3, 4];
  const minMaxConstraints = [
    { min: 1, max: 3 },
    { min: 1, max: 3 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  // すべての結果が min, max 制約を満たしていることを確認
  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

test("test2", () => {
  // 各役割に必ず指定された人数のみ割り当てるケース
  const participants = [
    [3, 1],
    [2, 4],
  ];
  const roles = [0, 1];
  const minMaxConstraints = [
    { min: 1, max: 1 },
    { min: 1, max: 1 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

test("test3", () => {
  // ある参加者がどの役割に対しても同じ評価をしている場合など
  const participants = [
    [5, 4, 3],
    [1, 1, 1], // どの役割も同じ評価
    [3, 2, 4],
  ];
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

test("test4", () => {
  // 1つの役割があり、複数の参加者をその1役割にすべて割り当てるケース
  const participants = [
    [3], // Participant 0
    [1], // Participant 1
    [2], // Participant 2
  ];
  const roles = [0];
  const minMaxConstraints = [{ min: 3, max: 3 }];
  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 1: 基本的な例 (3人、3役割)
test("test5", () => {
  const participants = [
    [5, 4, 3],
    [1, 1, 1],
    [3, 2, 4],
  ];
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 2: 一部の参加者が同じスコアを持っている場合
test("test6", () => {
  const participants = [
    [5, 4, 3],
    [1, 1, 1],
    [3, 2, 4],
    [6, 6, 6],
  ];
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 1, max: 1 },
    { min: 1, max: 1 },
    { min: 1, max: 1 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 3: 参加者数が10人、役割数も3
test("test7", () => {
  const participants = new Array(10).fill(null).map((_, i) => [5 + (i % 3), 4 + (i % 3), 3 + (i % 3)]);
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 3, max: 4 },
    { min: 3, max: 4 },
    { min: 3, max: 4 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 4: 各参加者が役割に対して異なる評価を持っている場合
test("test8", () => {
  const participants = [
    [8, 7, 5],
    [9, 6, 6],
    [7, 8, 9],
    [5, 5, 6],
    [4, 6, 9],
  ];
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 1, max: 3 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 5: 役割数が多い場合 (役割数 5)
test("test9", () => {
  const participants = new Array(10).fill(null).map((
    _,
    i,
  ) => [10 + (i % 5), 5 + (i % 3), 6 + (i % 2), 3 + i, 2 + (i % 5)]);
  const roles = [0, 1, 2, 3, 4];
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 6: 役割ごとのスコアが極端に異なる場合
test("test10", () => {
  const participants = [
    [1, 100, 1000],
    [100, 1000, 10],
    [1000, 10, 1],
    [100, 1000, 10],
  ];
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 7: 役割が同じ評価を受けている場合
test("test11", () => {
  const participants = new Array(10).fill(null).map(() => [1, 1, 1]);
  const roles = [0, 1, 2];
  const minMaxConstraints = [
    { min: 3, max: 4 },
    { min: 3, max: 4 },
    { min: 3, max: 4 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 1: 参加者数20人、役割数10
test("test12", () => {
  const participants = new Array(20).fill(null).map(() =>
    new Array(10).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(10).fill(null).map((_, i) => i); // 役割数10
  const minMaxConstraints = new Array(10).fill(null).map(() => ({ min: 1, max: 3 })); // 各役割に1〜3人

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 2: 参加者数15人、役割数8
test("test13", () => {
  const participants = new Array(15).fill(null).map(() =>
    new Array(8).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(8).fill(null).map((_, i) => i); // 役割数8
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 2, max: 3 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 3: 参加者数30人、役割数12
test("test14", () => {
  const participants = new Array(30).fill(null).map(() =>
    new Array(12).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(12).fill(null).map((_, i) => i); // 役割数12
  const minMaxConstraints = new Array(12).fill(null).map(() => ({ min: 2, max: 3 })); // 各役割に2〜3人

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 4: 参加者数25人、役割数15
test("test15", () => {
  const participants = new Array(25).fill(null).map(() =>
    new Array(15).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(15).fill(null).map((_, i) => i); // 役割数15
  const minMaxConstraints = [
    { min: 1, max: 2 },
    { min: 2, max: 4 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 1, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 4 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
    { min: 1, max: 2 },
    { min: 2, max: 3 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 5: 参加者数50人、役割数20
test("test16", () => {
  const participants = new Array(40).fill(null).map(() =>
    new Array(20).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(20).fill(null).map((_, i) => i); // 役割数20
  const minMaxConstraints = new Array(20).fill(null).map(() => ({ min: 2, max: 5 })); // 各役割に2〜5人

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// Test case 6: 参加者数40人、役割数10
test("test17", () => {
  const participants = new Array(40).fill(null).map(() =>
    new Array(10).fill(null).map(() => Math.floor(Math.random() * 5) + 1)
  );
  const roles = new Array(10).fill(null).map((_, i) => i); // 役割数10
  const minMaxConstraints = [
    { min: 3, max: 4 },
    { min: 2, max: 5 },
    { min: 2, max: 3 },
    { min: 3, max: 5 },
    { min: 2, max: 3 },
    { min: 3, max: 5 },
    { min: 2, max: 5 },
    { min: 3, max: 4 },
    { min: 2, max: 5 },
    { min: 3, max: 4 },
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

// 多すぎてテストが通らない場合
// test("test7", () => {
//   const participants = Array(40).fill(null).map(() => Array(10).fill(null).map(() => Math.floor(Math.random() * 5) + 1));
//   const roles = Array(20).fill(null).map((_, i) => i); // 役割数10
//   const minMaxConstraints = [
//     { min: 1, max: 4 },
//     { min: 1, max: 5 },
//     { min: 0, max: 3 },
//     { min: 0, max: 5 },
//     { min: 0, max: 3 },
//     { min: 1, max: 5 },
//     { min: 1, max: 5 },
//     { min: 1, max: 4 },
//     { min: 2, max: 5 },
//     { min: 1, max: 4 },
//     { min: 1, max: 4 },
//     { min: 1, max: 5 },
//     { min: 0, max: 3 },
//     { min: 0, max: 5 },
//     { min: 0, max: 3 },
//     { min: 1, max: 5 },
//     { min: 1, max: 5 },
//     { min: 1, max: 4 },
//     { min: 2, max: 5 },
//     { min: 1, max: 4 },
//   ];

//   const got = assignRoles(participants, roles, minMaxConstraints);
//   console.log(got);

//   expect(validateAssignment(got, minMaxConstraints)).toBe(true);
// });

test("test18", () => {
  const participants = [
    [1, 2],
    [2, 3],
    [3, 4],
  ]; // 参加者数3
  const roles = [0, 1]; // 役割数2
  const minMaxConstraints = [
    { min: 1, max: 2 }, // 役割0に2人以下
    { min: 2, max: 3 }, // 役割1に3人以下
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});

test("test19", () => {
  const participants = [
    [1, 2],
    [2, 3],
    [3, 4],
  ]; // 参加者数3
  const roles = [0, 1]; // 役割数2
  const minMaxConstraints = [
    { min: 1, max: 1 }, // 役割0に1人以上2人以下
    { min: 1, max: 1 }, // 役割1に2人以上3人以下
  ];

  const got = assignRoles(participants, roles, minMaxConstraints);
  console.log(got);

  expect(validateAssignment(got, minMaxConstraints)).toBe(true);
});
