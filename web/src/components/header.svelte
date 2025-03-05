<script lang="ts">
  import { page } from "$app/state";

  let title = $state("");

  const titles = new Map([
    ["", ""],
    ["result", "結果"],
    ["submit", "希望の提出"],
    ["done", "希望の提出"],
    ["config", "管理"],
    ["new", "作成"],
  ]);
  $effect(() => {
    const path =
      page.url.pathname
        .split("/")
        .filter((it) => it !== "")
        .at(-1) ?? "";
    const newTitle = path && titles.get(path);
    if (newTitle != null) {
      title = newTitle;
    } else {
      title = "";
      console.warn("Unknown pathname:", path, "at url", page.url);
    }
  });
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
