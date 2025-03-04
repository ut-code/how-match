<script lang="ts">
  import { fly } from "svelte/transition";
  import type { ToastController } from "./toast-control.svelte";

  type Props = { toasts: ToastController };
  const { toasts }: Props = $props();
</script>

<div class="mt-3 ml-10 toast-start toast-top fixed backdrop-blur-md opacity-90">
  {#each toasts.toasts as toast}
    <div class="alert {toast.class}" transition:fly>
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
