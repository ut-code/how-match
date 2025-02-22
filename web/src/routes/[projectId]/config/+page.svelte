<script lang="ts">
  import Header from "~/components/header.svelte";
  import { onMount } from "svelte";
  import { client } from "~/api/client";
  import chain from "~/icons/Chain.svg";
  const { data } = $props();

  // TODO: fix this
  const schema_domain = "http://localhost:5173";
  const link = $derived(`${schema_domain}/${data.projectId}/submit`);

  let copyTimeout = $state(0);
  onMount(() => {
    const id = setInterval(() => (copyTimeout > 0 ? copyTimeout-- : null), 100);
    return () => clearTimeout(id);
  });
</script>

<div>
  <Header title="管理・設定" />
  {#await data.project}
    <span class="loading loading-xl"> </span>
  {:then project}
    <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
      <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
        <h3>プロジェクトの詳細</h3>
        <p>プロジェクト名: {"name" in project ? project.name : "N/A"}</p>
        <p>説明: {"description" in project ? (project.description) : "N/A"}</p>
        <p>締め切り: {"closed_at" in project ? (project.closed_at ?? "まだ締め切っていません") : "N/A"}</p>

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
      </div>
    </div>
    <section>
      <a class="btn btn-primary ml-8" href="./submit">提出の画面へ</a>
    </section>
    <section>
      <button
        class="btn mt-4 ml-8 btn-error"
        onclick={async () => {
          await client.projects[":projectId"].finalize.$put({
            param: {
              projectId: data.projectId,
            },
          });
        }}
        disabled={("closed_at" in project && project.closed_at) ? true : false}
      >
        締め切る
      </button>
    </section>
  {:catch err}
    プロジェクトの読み込みに失敗しました
  {/await}

  <!-- 提出 -->
  <!-- <section>
  <a class="btn btn-primary m-8" href="./submit">提出する</a>
  <label class="input input-bordered w-full">
    <img alt="" src={chain} class="h-[1rem] opacity-50 select-none" />
    <span class="select-none">提出用リンク</span>
    <input type="url" class="x-selectable" value={link} readonly />
    {#if copyTimeout === 0}
      <button
        class="btn btn-soft btn-primary"
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
</section>

  <section>
    <button
      class="btn m-8 btn-error"
      onclick={async () => {
        await client.projects[":projectId"].finalize.$put({
          param: {
            projectId: data.projectId,
          },
        });
      }}
    >
      締め切る
    </button>
  </section> -->
</div>
