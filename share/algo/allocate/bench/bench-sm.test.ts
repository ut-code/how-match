import { describe, expect, it } from "bun:test";
import { bench, type Context, useValidate } from "./_bench.ts";

// constraints
const MIN_ROLES_PER_PARTICIPANT = 1;
const MAX_ROLES_PER_PARTICIPANT = 6;
const MIN_PARTICIPANTS_PER_ROLE = 3;
const MAX_PARTICIPANTS_PER_ROLE = 6;

// performance
const PARTICIPANTS_COUNT = 50;
const ROLES_COUNT = 80;
const TIMEOUT = 10;

const cx: Context = {
  participantsCount: PARTICIPANTS_COUNT,
  rolesCount: ROLES_COUNT,
  minParticipantsPerRole: MIN_PARTICIPANTS_PER_ROLE,
  maxParticipantsPerRole: MAX_PARTICIPANTS_PER_ROLE,
  maxRolesPerParticipant: MAX_ROLES_PER_PARTICIPANT,
  minRolesPerParticipant: MIN_ROLES_PER_PARTICIPANT,
};

const name = "allocate/bench#sm";
describe(name, () => {
  it(
    `should be able to allocate ${PARTICIPANTS_COUNT} participants to ${ROLES_COUNT} roles in under ${TIMEOUT}ms`,
    () => {
      const { took, result } = bench(cx);
      console.log(`[${name}] time: ${took}ms`);
      expect(took).toBeLessThan(TIMEOUT);
      useValidate(cx, result);
    },
    { timeout: TIMEOUT },
  );
});
