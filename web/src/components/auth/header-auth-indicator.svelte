<script lang="ts">
  import { signOut } from "$lib/auth.ts";
  import { useAuth } from "~/lib/auth-utils.svelte.ts";
  import { useAction } from "~/lib/use-action.svelte";
  import { googleLogin } from "~/lib/auth-utils.svelte";
  import { page } from "$app/state";

  const auth = useAuth();

  const handleSignOut = useAction(async () => {
    await signOut();
    await auth.reload();
  });
</script>

{#if googleLogin.error}
  <div class="text-error text-center text-sm">
    {googleLogin.error}
  </div>
{/if}

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
  <button
    class="btn btn-sm btn-primary"
    disabled={googleLogin.processing}
    onclick={async () => {
      await googleLogin.run({
        callbackURL: page.url.pathname,
      });
    }}
  >
    Sign In
  </button>
{/if}
