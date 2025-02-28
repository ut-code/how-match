<script lang="ts">
  import { fly } from "svelte/transition";
  import type { ToastController } from "./toast-control.svelte";

  type Props = { toasts: ToastController };
  const { toasts }: Props = $props();
</script>

<div class="mt-3 ml-3 toast-start toast-top absolute">
  {#each toasts.toasts as toast}
    <div class="alert {toast.class}" transition:fly>
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
