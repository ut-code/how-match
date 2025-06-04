import type { SelectPreference } from "../../../model/schema.ts";
import type { RoleWithId } from "../../../model/schema.ts";
import { allocate } from "../allocate.ts";
import type { Config } from "../allocate.ts";
import { expect } from "bun:test";
import * as maps from "../lib/maps.ts";

export type Context = {
  participantsCount: number;
  rolesCount: number;
  minParticipantsPerRole: number;
  maxParticipantsPerRole: number;
  maxRolesPerParticipant: number;
  minRolesPerParticipant: number;
};
const config: Config = {
  dropTooManyRoles: true,
  allowMultipleRoles: true,
};

export function bench(cx: Context) {
  const participants: SelectPreference[] = Array.from(
    { length: cx.participantsCount },
    (_, i) => ({
      id: `p${i}`,
      participantName: `[p${i}]`,
      rolesCount: randomInt(
        cx.minRolesPerParticipant,
        cx.maxRolesPerParticipant,
      ),
      ratings: Array.from({ length: cx.rolesCount }, (_, j) => ({
        roleId: `r${j}`,
        score: randomInt(1, 5),
      })),
    }),
  );
  const roles: RoleWithId[] = Array.from({ length: cx.rolesCount }, (_, i) => ({
    id: `r${i}`,
    name: `[r${i}]`,
    min: cx.minParticipantsPerRole,
    max: cx.maxParticipantsPerRole,
  }));
  const start = performance.now();
  const result = allocate(participants, roles, config);
  const end = performance.now();
  return {
    took: end - start,
    result,
  };
}

/**
 * @param min inclusive
 * @param max inclusive
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useValidate(cx: Context, result: Map<string, string[]>) {
  expect(result.size).toBe(cx.participantsCount);
  const rolesCountMap = new Map<string, number>();
  for (const [_, roleIds] of result) {
    expect(roleIds.length).toBeGreaterThanOrEqual(cx.minRolesPerParticipant);
    expect(roleIds.length).toBeLessThanOrEqual(cx.maxRolesPerParticipant);
    for (const roleId of roleIds) {
      maps.increment(rolesCountMap, roleId);
    }
  }
  for (const [_, count] of rolesCountMap) {
    expect(count).toBeGreaterThanOrEqual(cx.minParticipantsPerRole);
    expect(count).toBeLessThanOrEqual(cx.maxParticipantsPerRole);
  }
}
