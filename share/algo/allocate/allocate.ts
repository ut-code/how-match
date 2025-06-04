import type { SelectPreference, RoleWithId } from "../../model/schema.ts";
import * as maps from "./lib/maps.ts";
import * as lists from "./lib/lists.ts";

/*
仕様

1. 1~5 の各志望レベル (lvl とおく) ごとに、以下を繰り返す (すべての人間が割り当てられたらそこで終了)
1.1. 各 role を「志望されている度」順に並べ替える
1.2. 志望人数が少ない role から順に、最大人数まで 志望度 = lvl かつ希望割当数割り当てられていない人間を割り当てる
2. 最小人数制約を満たさない role を潰す (すべての role が最小人数制約を満たすまで繰り返し)
2.1. 志望されている度が最小の role を潰す
2.2. 潰した role に割り当てられていた人間は、空いている role のうち最も志望度が高いものに割り当てられる

*/

export type Config = {
  dropTooManyRoles: boolean;
  allowMultipleRoles: boolean;
};
const DEFAULT_RATING = 1;
/**
 * @returns Map<participantId, roleId[]>
 */
export function allocate(
  _preferences: SelectPreference[],
  _roles: RoleWithId[],
  config: Config,
): Map<string, string[]> {
  const mut_preferences = _preferences.map((p) => ({
    ...p,
    ratings: new Map<string, number>(p.ratings.map((r) => [r.roleId, r.score])), // readonly
    rolesCount: config.allowMultipleRoles ? p.rolesCount : 1,
  }));
  const mut_rolesWithExtraProps = _roles.map((r) => ({
    ...r,
    wantedBy: 0,
    allocated: 0,
  }));
  const mut_allocatedRoles = new Map<string, string[]>();

  for (let lvl = 5; lvl >= 1; lvl--) {
    // 希望度を数える
    for (const role of mut_rolesWithExtraProps) {
      role.wantedBy = 0;
      for (const pref of mut_preferences) {
        let rating = pref.ratings.get(role.id);
        if (!rating) {
          pref.ratings.set(role.id, DEFAULT_RATING);
          rating = DEFAULT_RATING;
        }
        if (rating >= lvl) {
          role.wantedBy++;
        }
      }
    }

    // 希望度の低い順に
    mut_rolesWithExtraProps.sort((a, b) => a.wantedBy - b.wantedBy); // asc = smaller is first

    // 人間を割り当てる
    for (const role of mut_rolesWithExtraProps) {
      // (これをしないと、先に提出した人が有利)
      lists.shuffle(mut_preferences);
      for (const preference of mut_preferences) {
        // role がいっぱいの場合は終わって次の role に
        if (role.allocated >= role.max) {
          break;
        }

        // スコアが lvl 以上の
        const score = preference.ratings.get(role.id) ?? DEFAULT_RATING; // default should be unreachable
        if (score < lvl) continue;
        // 割り当てられていない人間に
        const allocated = mut_allocatedRoles.get(preference.id) ?? [];
        if (allocated.length >= preference.rolesCount) continue;

        // 割り当てる
        allocated.push(role.id);
        mut_allocatedRoles.set(preference.id, allocated);
        role.allocated++;
      }
    }

    // すべての人間が割り当てられたら終わる
    if (
      mut_preferences.every(
        (p) => p.rolesCount === (mut_allocatedRoles.get(p.id)?.length ?? 0),
      )
    ) {
      break;
    }
  }

  // 最小人数制約を満たさない role を潰す
  mut_rolesWithExtraProps.sort((a, b) => a.wantedBy - b.wantedBy); // asc
  while (true) {
    const roleToDrop = mut_rolesWithExtraProps.find((r) => r.allocated < r.min);
    if (!roleToDrop) break; // 終わり
    mut_rolesWithExtraProps.splice(
      mut_rolesWithExtraProps.indexOf(roleToDrop),
      1,
    );
    const participants: [string, string[]][] = [];
    for (const [participantId, roleIds] of mut_allocatedRoles) {
      if (!roleIds.includes(roleToDrop.id)) continue;
      lists.remove(roleIds, roleToDrop.id);
      participants.push([participantId, roleIds]);
    }

    for (const [participantId, _roleIds] of participants) {
      const availableRoles = mut_rolesWithExtraProps.filter(
        (r) => r.allocated < r.max,
      );
      const preference = mut_preferences.find((p) => p.id === participantId);
      if (!preference) {
        console.error(
          `[alloc] participant ${participantId} is not found in preferences`,
        );
        continue;
      }
      availableRoles.sort((a, b) => b.wantedBy - a.wantedBy); // desc
      const role = availableRoles[0];
      if (!role) {
        console.error(
          `[alloc] participant ${participantId} has no available roles`,
        );
        continue;
      }
      role.allocated++;
      mut_allocatedRoles.set(participantId, [
        ...(mut_allocatedRoles.get(participantId) ?? []),
        role.id,
      ]);
    }
  }

  // assertion
  assertAllocatedRolesAreValid(
    mut_allocatedRoles,
    mut_rolesWithExtraProps,
    config,
  );
  return mut_allocatedRoles;
}

function assertAllocatedRolesAreValid(
  // participant -> role[]
  participantRolesMap: Map<string, string[]>,
  roles: RoleWithId[],
  config: Config,
) {
  const rolesCountMap = new Map<string, number>();

  for (const [participantId, allocatedRoleIds] of participantRolesMap) {
    if (!config.allowMultipleRoles && allocatedRoleIds.length > 1) {
      throw new Error(
        `Participant ${participantId} is allocated to ${allocatedRoleIds.length} roles, but it should be allocated to at most 1 role`,
      );
    }
    for (const roleId of allocatedRoleIds) {
      maps.increment(rolesCountMap, roleId);
    }
  }

  // 人数制約の確認
  for (const role of roles) {
    const count = rolesCountMap.get(role.id);
    if (count === undefined) {
      if (!config.dropTooManyRoles) {
        throw new Error(`Role ${role.id} is not allocated`);
      }
      continue;
    }
    if (count < role.min) {
      throw new Error(
        `Role ${role.id} is allocated to ${count} participants, but it should be allocated to at least ${role.min} participants`,
      );
    }
    if (count > role.max) {
      throw new Error(
        `Role ${role.id} is allocated to ${count} participants, but it should be allocated to at most ${role.max} participants`,
      );
    }
  }
}
