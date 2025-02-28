<script lang="ts">
  import { onMount } from "svelte";
  import { type Client, createClient } from "~/api/client.ts";
  import Header from "~/components/header.svelte";
  import MdiVote from "virtual:icons/mdi/vote";
  import MdiCog from "virtual:icons/mdi/cog";
  import MdiGraph from "virtual:icons/mdi/graph";

  const client: Client = createClient({ fetch });
  async function getMyProjects(options?: { signal: AbortSignal }) {
    const res = await client.projects.mine.$get(options);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  }

  type Project = {
    id: string;
    name: string;
    description: string | null;
    closed_at: string | null;
    is_admin: number;
  };
  let projects = $state<Project[] | null>(null);

  onMount(() => {
    const ctrl = new AbortController();
    getMyProjects({ signal: ctrl.signal })
      .then((data) => {
        projects = data;
      })
      .catch(console.error);

    return () => ctrl.abort();
  });
</script>

<div>
  <Header title="" />
  <div class="p-2 hm-blocks-container">
    <div class="hm-block">
      <h2 class="text-xl">プロジェクトを作る</h2>
      <div class="flex justify-center p-2">
        <a href="/new" class="btn btn-xl btn-primary">新規作成</a>
      </div>
    </div>
    {#if !projects}
      <div class="flex justify-center p-4">
        <!-- TODO: 何もないときも常に loading になってしまう -->
        <span class="loading loading-xl"></span>
      </div>
    {:else}
      <div class="hm-block">
        <h2 class="text-xl">作成・提出したプロジェクト</h2>
        <ul class="list w-full bg-base-200 my-1 rounded-lg">
          {#if projects.length === 0}
            <li class="list-row flex">
              作成・提出したプロジェクトはありません。
            </li>
          {:else}
            {#each projects as project}
              <li class="list-row flex items-center">
                <span class="h-full flex-1">{project.name}</span>
                {#if project.is_admin}
                  <a
                    class="btn btn-primary btn-sm btn-outline"
                    href="/{project.id}/config"
                  >
                    <MdiCog />
                    管理
                  </a>
                {:else if project.closed_at !== null && new Date(project.closed_at).getTime() < new Date().getTime()}
                  <!-- 締切済み -->
                  <a class="btn btn-primary btn-sm" href="/{project.id}/result">
                    <MdiGraph />
                    結果
                  </a>
                {:else}
                  <a class="btn btn-primary btn-sm" href="/{project.id}/submit">
                    <MdiVote />
                    提出
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
