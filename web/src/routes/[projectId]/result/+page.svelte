<script lang="ts">
  const { data } = $props();
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
        {@const matches = Object.entries(result.participantsOnEachRole)}
        <div class="hm-block">
          <h2 class="text-xl">{result.projectName}</h2>
          <p>{result.projectDesc}</p>
        </div>
        {#if !matches.length}
          役職のある人はいません。
        {:else}
          {#each matches as [_roleId, role]}
            <div class="hm-block">
              <h2 class="text-xl">{role.role_name}</h2>
              {#each role.participants as participant}
                <p>{participant.participant_name} さん</p>
              {/each}
            </div>
          {/each}
        {/if}
      {/if}
    {/await}
    <div class="flex justify-end">
      <a href="/" class="btn btn-primary">ホームに戻る</a>
    </div>
  </div>
</div>
