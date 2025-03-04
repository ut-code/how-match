<script lang="ts">
  import { fly } from "svelte/transition";
  import type { ToastController } from "./toast-control.svelte";

  type Props = { toast: ToastController };
  const { toast }: Props = $props();
</script>

<div class="mt-3 ml-3 toast-start toast-top absolute">
  {#each toast.toasts as toast}
    <div class="alert {toast.class}" transition:fly>
      <span>{toast.message}</span>
    </div>
  {/each}
</div>
