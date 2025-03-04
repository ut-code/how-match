<script lang="ts">
  import { onDestroy } from "svelte";

  const { data } = $props();

  let copyTimeout = 0;

  const interval = setInterval(() => {
    if (copyTimeout > 0) {
      copyTimeout--;
    }
  }, 100);

  onDestroy(() => clearInterval(interval));
</script>

<div>
  <div class="hm-blocks-container">
    {#await data.stream}
      <span class="loading loading-xl"> </span>
    {:then res}
      {#if !res.ok}
        failed to load result. code: {res.code}
        message: {res.message}
      {:else}
        {@const result = res.data}
        <div class="hm-block">
          <h2 class="text-xl">{result.projectName}</h2>
          <p>{result.projectDesc}</p>
        </div>
        {#each Object.entries(result.participantsOnEachRole) as [_roleId, role]}
          <div class="hm-block">
            <h2 class="text-xl">{role.role_name}</h2>
            {#each role.participants as participant}
              <p>{participant.participant_name} さん</p>
            {/each}
          </div>
        {/each}
      {/if}
    {/await}
    <div class="flex justify-end">
      <a href="/" class="btn btn-primary">ホームに戻る</a>
    </div>
  </div>
</div>
