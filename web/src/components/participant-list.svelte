<script lang="ts">
  import type { SelectParticipants } from "share/schema.ts";

  type Props = {
    participants: SelectParticipants;
    multipleRoles: boolean;
  };

  const { participants, multipleRoles }: Props = $props();
</script>

<ul class="list">
  {#each participants as participant}
    <li class="list-row">
      <span class="list-col">{participant.name}</span>
      {#if multipleRoles}
        <span class="list-col-grow text-xs text-gray-400">
          wants {participant.rolesCount} roles
        </span>
      {/if}
    </li>
  {/each}
</ul>
