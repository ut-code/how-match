<script lang="ts">
  import { goto } from "$app/navigation";
  import { Client } from "~/data/client.ts";
  import SubmitPage from "~/pages/submit/page.svelte";
  import type { PageProps } from "./$types.ts";

  const { data }: PageProps = $props();

  async function handleSubmit({
    participantName,
    rolesCount,
    ratings,
  }: {
    participantName: string;
    rolesCount: number;
    ratings: Record<string, number>;
  }) {
    const client = new Client(fetch);
    const preference = {
      participantName,
      rolesCount,
    };
    await client.submit(data.project.id, preference, ratings);
    await goto(`/${data.project.id}/config`);
  }
</script>

{#if data.project === null}
  <div class="hm-blocks-container">
    <p>プロジェクトが見つかりませんでした</p>
  </div>
{:else}
  <SubmitPage
    project={data.project}
    roles={data.roles}
    prevData={data.prev}
    onsubmit={handleSubmit}
  />
{/if}
