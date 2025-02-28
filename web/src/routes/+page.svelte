<script lang="ts">
import { onMount } from "svelte";
import { type Client, createClient } from "~/api/client.ts";
import Header from "~/components/header.svelte";

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
      <h2 class="text-xl">プロジェクトを新規作成する</h2>
      <div class="flex justify-center p-6">
        <a href="/new" class="btn btn-lg btn-primary">新規作成</a>
      </div>
      {#if !projects}
        <span>Welcome! this is being prerendered.</span>
      {:else}
        <ul class="list w-full bg-base-200 rounded-box shadow-md">
          <li class="p-4 pb-2 text-xl opacity-60 tracking-wide">
            作成・提出したプロジェクト
          </li>
          {#if projects.length === 0}
            <li class="list-row flex">
              作成・提出したプロジェクトはありません。
            </li>
          {:else}
            {#each projects as project}
              <li class="list-row flex">
                <span class="h-full flex-1">{project.name}</span>
                {#if project.is_admin}
                  <a class="btn btn-primary btn-sm btn-outline" href="/{project.id}/config">
                    管理
                  </a>
                {/if}
                {#if project.closed_at !== null && new Date(project.closed_at).getTime() < new Date().getTime()}
                  <!-- 締切済み -->
                  <a class="btn btn-success btn-sm" href="/{project.id}/result">
                    結果
                  </a>
                {:else}
                  <a class="btn btn-primary btn-sm" href="/{project.id}/submit">
                    提出
                  </a>
                {/if}
              </li>
            {/each}
          {/if}
        </ul>
      {/if}
    </div>
  </div>
</div>
