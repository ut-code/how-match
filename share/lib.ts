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
