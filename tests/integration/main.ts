import { multipleMatch } from "share/logic/min-flow/multiple";
import { participants, ratings, roles } from "./data.ts";

const participantsWithPreferences = innerJoin(
  participants,
  ratings,
  (p, r) => p.id === r.participantId,
);

const preferencesByParticipant = Map.groupBy(
  participantsWithPreferences,
  (p) => p.participantId,
);

const participantInput = Array.from(preferencesByParticipant.entries()).map(
  ([participantId, preferences]) => ({
    id: participantId,
    rolesCount: preferences[0]?.rolesCount ?? 0,
    preferences: preferences.map((p) => ({
      roleId: p.roleId,
      score: p.score,
    })),
  }),
);

const roleConstraints = roles;

const roleInput = roleConstraints.map((role) => ({
  id: role.id,
  capacity: role.max, // multiple mode の場合、max と min は同一
}));

const matching = multipleMatch(participantInput, roleInput, {
  dropTooManyRoles: true,
});

console.log(
  innerJoin(matching, participants, (m, p) => m.participantId === p.id).map(
    (it) => ({
      rolesCount: it.rolesCount,
      assignedLen: it.roleIds.length,
    }),
  ),
);

function innerJoin<T, U>(
  arr1: T[],
  arr2: U[],
  on: (t: T, u: U) => boolean,
): (T & U)[] {
  return arr1.flatMap((t) =>
    arr2.filter((u) => on(t, u)).map((u) => ({ ...t, ...u })),
  );
}
