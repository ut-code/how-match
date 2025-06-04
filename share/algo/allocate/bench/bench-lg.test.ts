import { describe, expect, it } from "bun:test";
import { bench, type Context } from "./_bench.ts";
import { useValidate } from "./_bench.ts";

// constraints
const MIN_ROLES_PER_PARTICIPANT = 1;
const MAX_ROLES_PER_PARTICIPANT = 6;
const MIN_PARTICIPANTS_PER_ROLE = 3;
const MAX_PARTICIPANTS_PER_ROLE = 6;

// performance
const PARTICIPANTS_COUNT = 1000;
const ROLES_COUNT = 800;
const TIMEOUT = 1000; // preferably under 10ms

const name = "allocate/bench#lg";
describe(name, () => {
  it(
    `should be able to allocate ${PARTICIPANTS_COUNT} participants to ${ROLES_COUNT} roles in under ${TIMEOUT}ms`,
    () => {
      const cx: Context = {
        participantsCount: PARTICIPANTS_COUNT,
        rolesCount: ROLES_COUNT,
        minParticipantsPerRole: MIN_PARTICIPANTS_PER_ROLE,
        maxParticipantsPerRole: MAX_PARTICIPANTS_PER_ROLE,
        maxRolesPerParticipant: MAX_ROLES_PER_PARTICIPANT,
        minRolesPerParticipant: MIN_ROLES_PER_PARTICIPANT,
      };
      const { took, result } = bench(cx);
      console.log(`[${name}] time: ${took}ms`);
      expect(took).toBeLessThan(TIMEOUT);
      useValidate(cx, result);
    },
    { timeout: TIMEOUT },
  );
});
