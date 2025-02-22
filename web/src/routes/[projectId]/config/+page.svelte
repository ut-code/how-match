<script lang="ts">
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
  <h1>設定</h1>
  <p>Project ID: {data.projectId}</p>
</div>

<!-- about -->
<section>
  {#await data.project}
    <span class="loading loading-xl"> </span>
  {:then project}
    DATA:
    <span>{JSON.stringify(project)}</span>
  {:catch err}
    プロジェクトの読み込みに失敗しました
  {/await}
</section>

<!-- 提出 -->
<section>
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

<!-- 締切 -->
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
</section>
