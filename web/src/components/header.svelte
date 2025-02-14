<script lang="ts">
  let { title } = $props();
</script>

<header class="fixed top-0 left-0 w-full z-30 border-b border-primary bg-white">
  <div class="h-12 px-6 flex items-center justify-between">
    <span class="text-xl">
      {title}
    </span>
  </div>
</header>
