<script lang="ts">
  import RoleEditor from "~/components/role-editor.svelte";
  import { mockRoles } from "~/mock-data.ts";
</script>

<div class="hm-block mt-20">
  <section id="roles" class="flex flex-col gap-2">
    <h3 class="text-pale text-sm">役職</h3>
    <RoleEditor roles={mockRoles} projectId="this-does-not-exist" />
  </section>
</div>
