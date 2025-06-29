<script lang="ts">
  import { signOut } from "$lib/auth.ts";
  import { useAuth } from "~/lib/auth-utils.svelte.ts";
  import { useAction } from "~/lib/use-action.svelte";

  const auth = useAuth();

  const handleSignOut = useAction(async () => {
    await signOut();
    await auth.reload();
  });
</script>

{#if auth.user}
  <span class="text-sm">{auth.user.name}</span>
  <button
    class="btn btn-sm btn-outline"
    onclick={handleSignOut.run}
    disabled={handleSignOut.processing}
  >
    {handleSignOut.processing ? "Signing out..." : "Sign Out"}
  </button>
{:else if auth.loading}
  <span class="loading loading-dots"></span>
{:else}
  <a href="/signin" class="btn btn-sm btn-primary">Sign In</a>
{/if}
