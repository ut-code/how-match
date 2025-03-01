<script lang="ts">
  let { title } = $props();
</script>

<header class="sticky top-0 left-0 w-full z-30 px-6 pt-6">
  <div
    class="h-14 px-6 gap-8 flex items-center align-middle rounded-xl bg-white/60 backdrop-blur-md border border-gray-200"
  >
    <a class="font-bold text-xl cursor-pointer" href="/">how-match</a>
    <span class="text-xl">
      {title}
    </span>
  </div>
</header>
