export function structureParticipants(
  participantsWithPreferences: {
    id: string;
    rolesCount: number;
    score: number;
    roleId: string;
  }[],
): {
  id: string;
  rolesCount: number;
  preferences: {
    roleId: string;
    score: number;
  }[];
}[] {
  const preferencesByParticipant = Map.groupBy(
    participantsWithPreferences,
    (p) => p.id,
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
  return participantInput;
}

type MatchResult = {
  participantId: string;
  roleIds: string[];
};

export function flattenMatchingResult(
  matching: MatchResult[],
  projectId: string,
) {
  const result: {
    id: string;
    projectId: string;
    roleId: string;
    participantId: string;
  }[] = [];
  matching.forEach((m) => {
    m.roleIds.forEach((roleId) => {
      result.push({
        id: crypto.randomUUID(),
        projectId: projectId,
        roleId: roleId,
        participantId: m.participantId,
      });
    });
  });
  return result;
}

export function structureMatches(
  struct: {
    participantId: string;
    roleId: string;
  }[],
): Record<string, string[]> {
  const result = struct.reduce(
    (acc, cur) => {
      if (!acc[cur.roleId]) {
        acc[cur.roleId] = [];
      }
      acc[cur.roleId]?.push(cur.participantId);
      return acc;
    },
    {} as Record<string, string[]>,
  );
  return result;
}
