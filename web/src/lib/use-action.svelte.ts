export function useAction<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
) {
  const state = $state<{
    processing: boolean;
    error: string | null;
    run: (...args: Args) => Promise<T | undefined>;
    reset: () => void;
  }>({
    processing: false,
    error: null,
    run: async (...args: Args) => {
      if (state.processing) return;
      state.processing = true;
      state.error = null;
      try {
        return await fn(...args);
      } catch (e) {
        state.error = e instanceof Error ? e.message : "Unknown error";
        throw e;
      } finally {
        state.processing = false;
      }
    },
    reset: () => {
      state.processing = false;
      state.error = null;
    },
  });

  return state;
}
