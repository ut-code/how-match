<script lang="ts">
  import type { SelectParticipant } from "service/db/schema";
  import type { SelectProject } from "share/schema";

  type Props = {
    project: SelectProject;
    participants: SelectParticipant[];
  };
  const { project, participants }: Props = $props();
</script>

<section id="submissions" class="list bg-base-100 rounded-box shadow-md">
  <h2 class="p-4 pb-2 text-xs tracking-wide opacity-60">提出した人</h2>
  <ul class="list bg-base-100 rounded-box shadow-md">
    {#if !participants.length}
      <li class="list-row">
        <div
          class="list-col-grow border-b-base-200 text-xs font-semibold opacity-60"
        >
          提出者がいません
        </div>
      </li>
    {:else}
      {#each participants as participant}
        <li class="list-row">
          <div class="border-b-base-200 text-xs font-semibold opacity-60">
            {participant.name}
          </div>
          <div class="list-col-grow border-b-base-200 text-xs opacity-60">
            {#if project.multipleRoles}
              wants {participant.rolesCount} roles
            {/if}
          </div>
          {#if participant.isAdmin}
            <span class="badge badge-soft badge-info"> 管理者 </span>
          {/if}
        </li>
      {/each}
    {/if}
  </ul>
</section>
