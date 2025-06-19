type RatingsDb = {
  roleId: string;
  participantId: string;
  score: number;
};

type RatingsApp = Record<`${string}->scored->${string}`, number>;

export function hydrateRoleScore(data: RatingsDb[]): RatingsApp {
  const ratings: RatingsApp = {};
  for (const { roleId, participantId, score } of data) {
    ratings[`${participantId}->scored->${roleId}`] = score;
  }
  return ratings;
}

export function dehydrateRoleScore(data: RatingsApp): RatingsDb[] {
  const ratings: RatingsDb[] = [];
  for (const [key, value] of Object.entries(data)) {
    const [participantId, roleId] = key.split("->scored->");
    if (!(roleId && participantId)) {
      throw new Error("Invalid key");
    }
    ratings.push({
      roleId,
      participantId,
      score: value,
    });
  }
  return ratings;
}
