<script lang="ts">
  import Header from "~/components/header.svelte";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import { db } from "service/db/client.ts";
    import { matches, participants, roles } from "service/db/schema.ts";
    import { eq } from 'drizzle-orm';
    import route from "service/routes/projects.js";

  const { data } = $props();
  const schema_domain = "http://localhost:5173";
  const link = `${schema_domain}/${data.projectId}/result`;

  let copyTimeout = 0;
  let matchList: {
    role_id: string;
    participant_id: string;
    role_name: string;
    account_name: string;
  }[] = [];

  onMount(async () => {
    try {
      // fetchを使用してエンドポイントから結果を取得
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const match_result = await response.json();
      matchList = match_result;  // 取得したデータをmatchListにセット
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  });

  const interval = setInterval(() => {
    if (copyTimeout > 0) { copyTimeout--; }
  }, 100);

  onDestroy(() => clearInterval(interval));
</script>

<style>
  .example2 {
    list-style: disc;
  }
</style>

<div>
  <Header title={data.projectId} />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>{data.projectId}</p>
      <h1>今年は以下の役職を募集しました。</h1>
      {#each matchList as match}
        <div>
          <h2>{match.role_name}</h2>
          <ul class="example2">
            {#each match.role_id}
              <li>{match.account_name}さん</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
    <div class="flex justify-start">
      <button type="button" class="btn btn-primary">
        戻る
      </button>
    </div>
  </div>
</div>
