import type { Session, User } from "better-auth";
import { getSession, signIn } from "./auth.ts";
import { useAction } from "./use-action.svelte.ts";

export function useAuth() {
  const current = $state<{
    user: User | null;
    session: Session | null;
    loading: boolean;
    reload: () => Promise<void>;
  }>({
    user: null,
    session: null,
    loading: true,
    reload,
  });

  async function reload() {
    try {
      const session = await getSession();
      current.user = session?.data?.user || null;
      current.session = session?.data?.session || null;
    } catch (error) {
      console.error("Failed to get session:", error);
      current.user = null;
      current.session = null;
    } finally {
      current.loading = false;
    }
  }

  $effect(() => {
    reload();
  });

  return current;
}

export const googleLogin = useAction(
  async ({ callbackURL }: { callbackURL: string }) => {
    await signIn.social({
      provider: "google",
      callbackURL,
    });
  },
);
