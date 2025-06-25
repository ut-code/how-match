export function proxify<T>(obj: T): T {
  const val = $state(obj);
  return val;
}
