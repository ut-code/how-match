<script lang="ts">
  import RoleList from "../../../components/role-list.svelte";
  import { mockRoles } from "~/mock-data.ts";
</script>

<div class="hm-block mt-20">
  <section id="roles" class="flex flex-col gap-2">
    <h3 class="text-pale text-sm">役職</h3>
    <RoleList roles={mockRoles} />
  </section>
</div>
