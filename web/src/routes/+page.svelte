<script lang="ts">
  import MdiCog from "virtual:icons/mdi/cog";
  import MdiGraph from "virtual:icons/mdi/graph";
  import MdiWrench from "virtual:icons/mdi/wrench";
  import type { SelectProject } from "share/schema.ts";
  import { onMount } from "svelte";
  import { Client } from "~/data/client.ts";

  const client = new Client(fetch);

  // TODO: separate admin and participated projects
  let projects = $state<SelectProject[] | null>(null);

  onMount(() => {
    const ctrl = new AbortController();
    client
      .getMyProjects({ signal: ctrl.signal })
      .then((data) => {
        projects = [...data.admin, ...data.participated];
      })
      .catch(console.error);

    return () => ctrl.abort();
  });
</script>

<div>
  <div class="hm-blocks-container p-2">
    <div class="hm-block text-center">
      <div class="mx-auto max-w-md px-2 py-6">
        <h2 class="text-3xl">プロジェクトを作る</h2>
        <a href="/new" class="btn btn-xl btn-primary mt-5">
          <MdiWrench class="mr-1" />作成
        </a>
      </div>
    </div>
    {#if !projects}
      <div class="flex justify-center p-4">
        <span class="loading loading-xl"></span>
      </div>
    {:else}
      <div class="hm-block">
        <h2 class="text-xl">作成・提出したプロジェクト</h2>
        <ul class="list bg-base-300 my-1 w-full rounded-xl">
          {#if projects.length === 0}
            <li class="list-row flex">
              作成・提出したプロジェクトはありません。
            </li>
          {:else}
            {#each projects as project}
              <li class="list-row flex items-center">
                <span class="h-full flex-1">{project.name}</span>
                {#if project.closedAt !== null && new Date(project.closedAt).getTime() < new Date().getTime()}
                  <!-- 締切済み -->
                  <a class="btn btn-primary" href="/{project.id}/result">
                    <MdiGraph />
                    結果
                  </a>
                {:else}
                  <a class="btn btn-primary" href="/{project.id}/config">
                    <MdiCog />
                    確認
                  </a>
                {/if}
              </li>
            {/each}
          {/if}
        </ul>
      </div>
    {/if}
  </div>
</div>
