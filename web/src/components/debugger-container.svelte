<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<main class="mx-auto mt-100 flex max-w-sm flex-col gap-8">
  {@render children()}
</main>
