<script lang="ts">
  type Participant = {
    id: string;
    name: string;
    rolesCount: number;
    isAdmin: number;
  };
  type Props = {
    participants: Participant[];
    multipleRoles: boolean;
    adminOnly?: {
      roles: RoleWithId[];
      preferences: Record<string, number>;
    };
  };

  const { participants, multipleRoles, adminOnly }: Props = $props();

  $inspect(adminOnly?.preferences);
</script>

{#if adminOnly}
  {@render ParticipantTable()}
{:else}
  {@render ParticipantList()}
{/if}

{#snippet ParticipantList()}
  <ul class="list">
    {#each participants as participant}
      <li class="list-row">
        <span class="list-col">{participant.name}</span>
        {#if multipleRoles}
          <span class="list-col-grow text-xs text-gray-400"
            >wants {participant.rolesCount} roles</span
          >
        {/if}
        {#if participant.isAdmin}
          <span class="badge badge-secondary badge-xs text-xs">Admin</span>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet ParticipantTable()}
  <div class="overflow-x-auto">
    <table class="table-zebra table w-full min-w-max">
      {#if !participants.length}
        <tbody>
          <tr>
            <td colspan="100" class="text-center opacity-60">
              No participants yet
            </td>
          </tr>
        </tbody>
      {:else}
        <thead>
          <tr>
            <th class="bg-base-100 sticky left-0 min-w-32 text-left">Name</th>
            {#if adminOnly}
              {#each adminOnly.roles as role}
                <th
                  class="w-12 max-w-20 overflow-clip px-2 text-center text-xs font-medium"
                >
                  {role.name}
                </th>
              {/each}
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each participants as participant}
            <tr class="h-7">
              <td class="bg-base-100 sticky left-0 px-2 py-0">
                <div class="min-w-28">
                  <div class="text-xs">
                    <span>{participant.name}</span>
                    {#if multipleRoles}
                      <span class="text-gray-400">
                        {participant.rolesCount} roles
                      </span>
                    {/if}
                  </div>
                  {#if participant.isAdmin}
                    <div class="badge badge-secondary badge-xs text-xs">
                      Admin
                    </div>
                  {/if}
                </div>
              </td>

              {#if adminOnly}
                {#each adminOnly.roles as role}
                  {@const prefValue =
                    adminOnly.preferences[
                      `${participant.id}->scored->${role.id}`
                    ]}
                  <td class="px-2 py-0 text-center">
                    {#if prefValue !== undefined}
                      <span
                        class={[
                          "badge badge-sm font-mono",
                          prefValue >= 5 && "badge-info",
                          prefValue === 4 && "badge-success",
                          prefValue === 3 && "badge-neutral",
                        ]}
                      >
                        {prefValue}
                      </span>
                    {:else}
                      <span class="text-gray-400">-</span>
                    {/if}
                  </td>
                {/each}
              {/if}
            </tr>
          {/each}
        </tbody>
      {/if}
    </table>
  </div>
{/snippet}
