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

<header class="sticky top-0 left-0 z-30 w-full px-6 pt-6">
  <div
    class="flex h-14 items-center gap-8 rounded-xl border border-gray-200 bg-white/60 px-6 align-middle backdrop-blur-md"
  >
    <a class="cursor-pointer text-xl font-bold" href="/">how-match</a>
    <span class="text-xl">
      {title}
    </span>
  </div>
</header>
