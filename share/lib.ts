export function panic(message: string): never {
  throw new Error(message);
}

export function asserting<T>(cond: T | null | undefined, message?: string): T {
  if (cond == null) {
    throw new Error(`Assertion failed: ${message ?? "message not given"}`);
  }
  return cond;
}
export function assert(cond: boolean, message?: string): asserts cond {
  if (!cond) {
    throw new Error(`Assertion failed: ${message ?? "message not given"}`);
  }
}
export function at<T>(list: T[], idx: number): T {
  const elem = list[idx];
  if (elem === undefined)
    throw new Error(`elemAt: item not found at index ${idx} in list`);
  return elem;
}

// min is inclusive and max is exclusive
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}
