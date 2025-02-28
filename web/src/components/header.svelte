<script lang="ts">
import Icon123 from "~icons/material-symbols/123";
let { title } = $props();
</script>

<header class="fixed top-0 left-0 w-full z-30 border-b border-primary bg-white">
  <div class="h-12 px-6 gap-8 flex items-center align-middle">
    <a class="font-bold text-xl cursor-pointer" href="/">how-match</a>
    <span class="text-xl">
      {title}
    </span>
  </div>
</header>
