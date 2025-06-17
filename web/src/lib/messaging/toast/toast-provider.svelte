<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";
  import { setupToast, ToastServer } from "./toast-controller.svelte";

  type Props = { children: Snippet };
  const { children }: Props = $props();
  const ctrl = new ToastServer();
  setupToast(ctrl);
</script>

{@render children()}
<div class="toast-start toast-top fixed top-20 z-40 mt-3 ml-3">
  {#each ctrl.toasts as toast}
    <div class="alert {toast.class}" transition:fly>
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
