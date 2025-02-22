<script lang="ts">
  import Header from "~/components/header.svelte";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { generateURL } from "~/api/origins.svelte.ts";

  const { data } = $props();
  const link = generateURL({
    pathname: `${data.projectId}/result`,
  });

  let copyTimeout = 0;
  let matchList: {
    role_id: string;
    participant_id: string;
    role_name: string;
    account_name: string;
    project_name: string;
    project_desc: string;
  }[] = [];
  }[] = $state([]);

  onMount(async () => {
    try {
      // fetchを使用してエンドポイントから結果を取得
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const match_result = await response.json();
      matchList = match_result; // 取得したデータをmatchListにセット
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  });

  const interval = setInterval(() => {
    if (copyTimeout > 0) {
      copyTimeout--;
    }
  }, 100);

  onDestroy(() => clearInterval(interval));
</script>

<div>
  <Header title={matchList.length > 0 ? matchList[0].project_name : "プロジェクト名未取得"} />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>{matchList.length > 0 ? matchList[0].project_name : "プロジェクト名未取得"}</p>
      <h1>{matchList.length > 0 ? matchList[0].project_desc : "プロジェクト説明未取得"}</h1>
      {#each matchList as match}
        <div>
          <h2>{match.role_name}</h2>
          <ul class="example2">
            <li>{match.account_name}さん</li>
          </ul>
        </div>
      {/each}
    </div>
    <div class="flex justify-start">
      <button type="button" class="btn btn-primary">戻る</button>
    </div>
  </div>
</div>

<style>
  .example2 {
    list-style: disc;
  }
</style>
