<script lang="ts">
  import { mockParticipants, mockRoles } from "~/mock-data.ts";
  import Page from "~/pages/participant-table/page.svelte";
  import { createRandomPreferences } from "../config/mock.svelte";
</script>

<Page
  participants={mockParticipants}
  roles={mockRoles}
  preferences={createRandomPreferences(mockParticipants, mockRoles)}
  multipleRoles={true}
/>
