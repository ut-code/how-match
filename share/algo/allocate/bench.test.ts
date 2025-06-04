import { describe, expect, it } from "bun:test";
import type { SelectPreference, RoleWithId } from "../../model/schema.ts";
import { allocate } from "./allocate.ts";
import type { Config } from "./allocate.ts";
import * as maps from "./lib/maps.ts";

const config: Config = {
  dropTooManyRoles: true,
  allowMultipleRoles: true,
};

const PARTICIPANTS_COUNT = 50;
const ROLES_COUNT = 80;
const MIN_ROLES_PER_PARTICIPANT = 1;
const MAX_ROLES_PER_PARTICIPANT = 6;
const MIN_PARTICIPANTS_PER_ROLE = 3;
const MAX_PARTICIPANTS_PER_ROLE = 6;

describe("allocate", () => {
  it(
    `should be able to allocate ${PARTICIPANTS_COUNT} participants to ${ROLES_COUNT} roles in under 10ms`,
    () => {
      const participants: SelectPreference[] = Array.from(
        { length: PARTICIPANTS_COUNT },
        (_, i) => ({
          id: `p${i}`,
          participantName: `p${i}`,
          rolesCount: 1,
          ratings: Array.from({ length: 100 }, (_, j) => ({
            roleId: `r${j}`,
            score: Math.random() * 5,
          })),
        }),
      );
      const roles: RoleWithId[] = Array.from(
        { length: ROLES_COUNT },
        (_, i) => ({
          id: `r${i}`,
          name: `r${i}`,
          min: MIN_PARTICIPANTS_PER_ROLE,
          max: MAX_PARTICIPANTS_PER_ROLE,
        }),
      );
      const start = performance.now();
      const ret = allocate(participants, roles, config);
      const end = performance.now();
      console.log(`[alloc] time: ${end - start}ms`);
      expect(end - start).toBeLessThan(10);

      expect(ret.size).toBe(PARTICIPANTS_COUNT);
      const rolesCountMap = new Map<string, number>();
      for (const [_, roleIds] of ret) {
        expect(roleIds.length).toBeGreaterThanOrEqual(
          MIN_ROLES_PER_PARTICIPANT,
        );
        expect(roleIds.length).toBeLessThanOrEqual(MAX_ROLES_PER_PARTICIPANT);
        for (const roleId of roleIds) {
          maps.increment(rolesCountMap, roleId);
        }
      }
      for (const [_, count] of rolesCountMap) {
        expect(count).toBeGreaterThanOrEqual(MIN_PARTICIPANTS_PER_ROLE);
        expect(count).toBeLessThanOrEqual(MAX_PARTICIPANTS_PER_ROLE);
      }
    },
    { timeout: 10 },
  );
});
