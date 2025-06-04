export function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}
export function dropReturning<T>(
  map: Map<string, T>,
  where: (value: T, key: string) => boolean,
): [string, T][] {
  const ret: [string, T][] = [];
  for (const [key, value] of map) {
    if (where(value, key)) {
      ret.push([key, value]);
      map.delete(key);
    }
  }
  return ret;
}
export function find<T>(
  map: Map<string, T>,
  where: (value: T, key: string) => boolean,
): [string, T] | undefined {
  for (const [key, value] of map) {
    if (where(value, key)) {
      return [key, value];
    }
  }
  return undefined;
}
