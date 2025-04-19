<script lang="ts">
  import { page } from "$app/state";
  import ThemeToggle from "~/components/theme-toggle.svelte";

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

<header class="sticky top-0 left-0 z-30 w-full flex-row px-6 pt-6">
  <div
    class="bg-base-200/60 border-base flex h-14 items-center justify-between rounded-xl border px-6 align-middle backdrop-blur-md sm:justify-start sm:gap-8"
  >
    <a class="cursor-pointer text-xl font-bold" href="/">how-match</a>
    <span class="text-xl">
      {title}
    </span>
    <span class="hidden sm:inline sm:flex-1"></span>
    <ThemeToggle />
  </div>
</header>
