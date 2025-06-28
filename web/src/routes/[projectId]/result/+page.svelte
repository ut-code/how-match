<script lang="ts">
  const { data } = $props();

  const result = $derived(data.result);

  const resultKeys = $derived(Object.keys(data.result.role_participants));
  const roles = $derived(
    data.roles.filter((role) => resultKeys.includes(role.id)),
  );
</script>

<div>
  <div class="hm-blocks-container">
    {#if !roles.length}
      役職のある人はいません。
    {:else}
      {#each roles as role}
        <div class="hm-block">
          <h2 class="text-xl">{role.name}</h2>
          {#each result.role_participants[role.id] as participantId}
            {@const p = data.participants.find((p) => p.id === participantId)}
            <p>
              {p ? `${p.name} さん` : "参加者が見つかりません"}
            </p>
          {/each}
        </div>
      {/each}
    {/if}
    <div class="flex justify-end">
      <a href="/" class="btn btn-primary">ホームに戻る</a>
    </div>
  </div>
</div>
