<script lang="ts">
  import { fly } from "svelte/transition";
  import type { ToastController } from "./toast-control.svelte";

  type Props = { toast: ToastController };
  const { toast: toasts }: Props = $props();
</script>

<div class="toast-start toast-top fixed top-20 z-40 mt-3 ml-3">
  {#each toasts.toasts as toast}
    <div class="alert {toast.class}" transition:fly>
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
