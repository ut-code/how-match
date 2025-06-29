export function useAction<T>(fn: () => Promise<T>) {
  let processing = $state(false);
  let error = $state("");

  return {
    processing,
    error,
    run: async () => {
      if (processing) return;
      processing = true;
      error = "";
      try {
        return await fn();
      } catch (e) {
        error = e instanceof Error ? e.message : "Unknown error";
        throw e;
      } finally {
        processing = false;
      }
    },
  };
}
