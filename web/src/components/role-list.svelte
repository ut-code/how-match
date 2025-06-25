<script lang="ts">
  import type { SelectRole } from "share/schema.ts";
  let { roles }: { roles: SelectRole[] } = $props();
</script>

<ul class="list bg-base-100 rounded-box">
  {#each roles as role (role.id)}
    <li class="list-row">
      <span class="list-col-grow">{role.name}</span>
      <div class="fieldset-label">
        Max
        <span class="xl:w-20">{role.max}</span>
      </div>
      <div class="fieldset-label">
        Min
        <span class="xl:w-20">{role.min}</span>
      </div>
    </li>
  {/each}
</ul>
