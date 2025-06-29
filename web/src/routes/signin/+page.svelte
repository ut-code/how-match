<script lang="ts">
  import { goto } from "$app/navigation";
  import { getSession } from "$lib/auth.js";
  import { onMount } from "svelte";
  import GoogleLoginButton from "~/components/auth/google-login-button.svelte";
  import { googleLogin } from "~/lib/auth-utils.svelte";

  onMount(async () => {
    const session = await getSession();
    if (session?.data?.user) {
      console.log("session exists: navigating to /");
      goto("/");
    }
  });
</script>

<div
  class="bg-base-100 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-md space-y-8">
    <div>
      <h2 class="text-base-content mt-6 text-center text-3xl font-extrabold">
        Sign in to your account
      </h2>
    </div>

    {#if googleLogin.error}
      <div class="text-error text-center text-sm">{googleLogin.error}</div>
    {/if}

    <div class="mt-8">
      <GoogleLoginButton
        onclick={async () => {
          await googleLogin.run();
          goto("/");
        }}
        disabled={googleLogin.processing}
      >
        {googleLogin.processing ? "Signing in..." : "Sign in with Google"}
      </GoogleLoginButton>
    </div>
  </div>
</div>
