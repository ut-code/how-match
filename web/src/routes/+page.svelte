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
    </div>
    {#if !projects}
      <span>Welcome! this is being prerendered.</span>
    {:else}
      <div class="hm-block">
        <h2 class="text-xl">作成・提出したプロジェクト</h2>
        {#if projects.length === 0}
          <span>作成・提出したプロジェクトはありません。</span>
        {:else}
          <ul class="menu w-full">
            {#each projects as project}
              <li class="w-full border-b border-gray-200 flex flex-row">
                <a href="/{project.id}/submit" class="abcde h-full flex-1">
                  <span>{project.name}</span>
                </a>
                {#if project.is_admin}
                  <a class="btn btn-primary btn-sm absolute right-13" href="/{project.id}/config">
                    管理
                  </a>
                {/if}
                {#if project.closed_at}
                  <a class="btn btn-primary btn-sm absolute right-0" href="/{project.id}/result">
                    結果
                  </a>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</div>
