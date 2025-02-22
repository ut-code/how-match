<script lang="ts">
  import Header from "~/components/header.svelte";
  import { onMount } from "svelte";
  import { type Client, createClient } from "~/api/client";
  import chain from "~/icons/Chain.svg";
  import { generateURL } from "~/api/origins.svelte.ts";
  import { page } from "$app/state";
  import { fly } from "svelte/transition";

  const client: Client = createClient({ fetch });
  const { data } = $props();

  const newlyCreated = page.url.searchParams.get("created") !== null;
  let createdToastShown = $state(false);
  onMount(() => {
    if (newlyCreated) {
      createdToastShown = true;
      setTimeout(() => {
        createdToastShown = false;

        // replace ?created with none s.t. it won't show "created!" after reload
        const next = new URL(window.location.href);
        next.search = "";
        window.history.pushState({}, "", next);
      }, 2000);
    }
  });

  const link = generateURL({
    pathname: `${data.projectId}/submit`,
  }).href;

  let copyTimeout = $state(0);
  onMount(() => {
    const id = setInterval(() => (copyTimeout > 0 ? copyTimeout-- : null), 100);
    return () => clearTimeout(id);
  });
</script>

<div class="toast-start toast-top absolute">
  {#if createdToastShown}
    <div class="alert alert-success z-31" transition:fly>
      <span class="z-31">プロジェクトを作成しました。</span>
    </div>
  {/if}
</div>

<div>
  <Header title="管理・設定" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      {#await data.project}
        <span class="loading loading-xl"> </span>
      {:then project}
        <h3>プロジェクトの詳細</h3>
        <p>プロジェクト名: {project.name}</p>
        <p>説明: {project.description}</p>
        <p>
          締め切り: {project.closed_at ?? "まだ締め切っていません"}
        </p>

        <label class="input input-bordered w-full">
          <img alt="" src={chain} class="h-[1rem] opacity-50 select-none" />
          <span class="select-none">提出用リンク</span>
          <input type="url" class="x-selectable" value={link} readonly />
          {#if copyTimeout === 0}
            <button
              class="btn btn-sm btn-soft btn-primary"
              onclick={async () => {
                await navigator.clipboard.writeText(link);
                copyTimeout = 20;
              }}
            >
              copy
            </button>
          {:else}
            <button disabled>copied!</button>
          {/if}
        </label>
        <!-- navigation -->
        <section>
          <div class="mt-6 ml-8">
            <a
              class="btn btn-primary m-4"
              href="./submit"
              class:btn-disabled={project.closed_at ? true : false}
            >提出の画面へ</a>
            <button
              class="btn btn-error m-4"
              onclick={async () => {
                await client.projects[":projectId"].$patch({
                  param: {
                    projectId: data.projectId,
                  },
                  json: {
                    done: true,
                  },
                });
                location.reload();
              }}
              disabled={project.closed_at ? true : false}
            >
              締め切る
            </button>
          </div>
        </section>
      {:catch}
        プロジェクトの読み込みに失敗しました
      {/await}
    </div>
  </div>
</div>
