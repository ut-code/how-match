<script lang="ts">
  import { page } from "$app/state";
  import ThemeToggle from "~/components/theme-toggle.svelte";
  import MdiWrench from "~icons/mdi/wrench";
  import HeaderAuthIndicator from "./auth/header-auth-indicator.svelte";

  const titles = new Map([
    ["", ""],
    ["result", "結果"],
    ["submit", "希望の提出"],
    ["done", "希望の提出"],
    ["config", "管理"],
    ["new", "作成"],
    ["table", "テーブル"],
    ["signin", "ログイン"],
    ["register", "登録"],
  ]);

  function getTitle() {
    if (page.url.pathname.startsWith("/debug")) return "";
    const path =
      page.url.pathname
        .split("/")
        .filter((it) => it !== "")
        .at(-1) ?? "";
    const newTitle = path && titles.get(path);
    if (newTitle != null) {
      return newTitle;
    }
    console.warn("Unknown pathname:", path, "at url", page.url);
    return "";
  }

  let title = $state(getTitle());
  $effect(() => {
    title = getTitle();
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

    {#if import.meta.env.DEV}
      <a href="/debug" class="btn btn-xl btn-accent mt-5">
        <MdiWrench class="mr-1" />
        Debug
      </a>
    {/if}
    <span class="hidden sm:inline sm:flex-1"></span>

    <div class="flex items-center gap-4">
      <HeaderAuthIndicator />
      <ThemeToggle />
    </div>
  </div>
</header>
