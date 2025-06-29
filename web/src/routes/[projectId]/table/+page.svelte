<script lang="ts">
  import Page from "~/pages/participant-table/page.svelte";
  import type { PageData } from "./$types";

  const { project, participants, roles, preferences }: PageData = $props();
</script>

<Page
  {participants}
  {roles}
  {preferences}
  multipleRoles={project.multipleRoles}
/>
