export function useAction<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
) {
  let processing = $state(false);
  let error = $state<string | null>(null);

  return {
    processing,
    error,
    run: async (...args: Args) => {
      if (processing) return;
      processing = true;
      error = null;
      try {
        return await fn(...args);
      } catch (e) {
        error = e instanceof Error ? e.message : "Unknown error";
        throw e;
      } finally {
        processing = false;
      }
    },
    reset: () => {
      processing = false;
      error = null;
    },
  };
}
