<script lang="ts">
  import { mockRoles } from "~/mock-data.ts";
  import RoleList from "../../../components/role-list.svelte";
</script>

<div class="hm-block mt-20">
  <section id="roles" class="flex flex-col gap-2">
    <h3 class="text-pale text-sm">役職</h3>
    <RoleList roles={mockRoles} />
  </section>
</div>
