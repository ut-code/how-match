<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<div class="h-screen">
  <main class="container mx-auto px-40">
    {@render children()}
  </main>
</div>
