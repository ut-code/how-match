export function asserting<T>(cond: T | null | undefined, message?: string): T {
  if (cond == null) {
    throw new Error(`Assertion failed: ${message ?? "message not given"}`);
  }
  return cond;
}
export function assert(cond: boolean, message?: string) {
  if (!cond) {
    throw new Error(`Assertion failed: ${message ?? "message not given"}`);
  }
  return cond;
}
export function at<T>(list: T[], idx: number): T {
  const elem = list[idx];
  if (!elem) throw new Error(`elemAt: item not found at index ${idx} in list`);
  return elem;
}
