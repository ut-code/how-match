<script lang="ts">
  import type { Ratings, SelectParticipants, SelectRole } from "share/schema";
  import ParticipantTable from "~/components/participant-table.svelte";

  type Props = {
    participants: SelectParticipants;
    roles: SelectRole[];
    multipleRoles: boolean;
    preferences: Record<string, Ratings>;
  };

  const { participants, roles, multipleRoles, preferences }: Props = $props();
</script>

<ParticipantTable {participants} {roles} {multipleRoles} {preferences} />
