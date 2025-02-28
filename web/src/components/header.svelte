<script lang="ts">
let { title } = $props();
</script>

<header
  class="sticky top-0 left-0 w-full z-30 border-b border-primary bg-white"
>
  <div class="h-12 px-6 gap-8 flex items-center align-middle">
    <a class="font-bold text-xl cursor-pointer" href="/">how-match</a>
    <span class="text-xl">
      {title}
    </span>
  </div>
</header>
