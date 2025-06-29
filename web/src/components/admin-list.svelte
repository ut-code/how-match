<script lang="ts">
  import type { SelectAdmins } from "share/schema.ts";

  let { admins }: { admins: SelectAdmins } = $props();
</script>

<ul class="list bg-base-100">
  {#each admins as admin (admin.id)}
    <li class="list-row">
      <span class="">{admin.name}</span>
    </li>
  {/each}
</ul>
