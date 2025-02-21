<script lang="ts">
  import Header from "~/components/header.svelte";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
</script>

<div class="container">
  <Header title="how-match" />
  <div class="mt-12 p-4">
    <div class="p-2">
      <h2 class="text-xl">プロジェクトを新規作成する</h2>
      <div class="flex justify-center p-6">
        <a href="/new" class="btn btn-lg btn-primary">新規作成</a>
      </div>
      {#if data?.projects?.length && data.projects.length > 0}
        <h2 class="text-xl">作成・提出したプロジェクト</h2>
        <ul class="menu w-full">
          {#each data.projects as project}
            <li class="border-b border-gray-200">
              <a href="/{project.id}/submit" class="w-full h-full flex justify-between">
                <span>{project.name}</span>
                <span class={`${!project.is_admin && "hidden"}`}>管理者</span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
