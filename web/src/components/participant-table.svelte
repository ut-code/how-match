<script lang="ts">
  import type {
    Ratings,
    SelectParticipants,
    SelectRole,
  } from "share/schema.ts";

  type Props = {
    participants: SelectParticipants;
    roles: SelectRole[];
    multipleRoles: boolean;
    preferences: Record<string, Ratings>;
  };

  const { participants, roles, multipleRoles, preferences }: Props = $props();
</script>

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
          {#each roles as role}
            <th
              class="w-12 max-w-20 overflow-clip px-2 text-center text-xs font-medium"
            >
              {role.name}
            </th>
          {/each}
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
              </div>
            </td>

            {#each roles as role}
              {@const prefValue = preferences[participant.id][role.id]}
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
          </tr>
        {/each}
      </tbody>
    {/if}
  </table>
</div>
