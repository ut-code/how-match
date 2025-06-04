import { describe, expect, it } from "bun:test";
import { allocate, type Config } from "./allocate.ts";
import type { SelectPreference, RoleWithId } from "../../model/schema.ts";

const config: Config = {
  dropTooManyRoles: false,
  allowMultipleRoles: false,
};
describe("allocate", () => {
  it("should not assign participants to roles that are full", () => {
    const participants: SelectPreference[] = [
      {
        id: "p1",
        participantName: "p1",
        rolesCount: 1,
        ratings: [{ roleId: "r1", score: 5 }],
      },
      {
        id: "p2",
        participantName: "p2",
        rolesCount: 1,
        ratings: [{ roleId: "r1", score: 4 }],
      },
    ];
    const roles: RoleWithId[] = [{ id: "r1", name: "r1", min: 1, max: 1 }];

    const result = allocate(participants, roles, config);

    expect(result).toEqual(new Map([["p1", ["r1"]]]));
  });

  it("should assign participants to roles with the highest score", () => {
    const participants: SelectPreference[] = [
      {
        id: "p1",
        participantName: "p1",
        rolesCount: 1,
        ratings: [
          { roleId: "r1", score: 5 },
          { roleId: "r2", score: 4 },
        ],
      },
      {
        id: "p2",
        participantName: "p2",
        rolesCount: 1,
        ratings: [
          { roleId: "r1", score: 3 },
          { roleId: "r2", score: 5 },
        ],
      },
    ];
    const roles: RoleWithId[] = [
      { id: "r1", name: "r1", min: 1, max: 1 },
      { id: "r2", name: "r2", min: 1, max: 1 },
    ];

    const result = allocate(participants, roles, config);

    expect(result).toEqual(
      new Map([
        ["p1", ["r1"]],
        ["p2", ["r2"]],
      ]),
    );
  });
});
