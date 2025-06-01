<script lang="ts">
  import ConfigMenu from "~/pages/config/config-menu.svelte";
  import { mockData, mockActions } from "./mock.svelte.ts";
  let isAdmin = $state(false);
</script>

<section class="bg-base-200 flex flex-col gap-2 p-4">
  <h1 class="text-2xl font-bold">Debugger Options</h1>
  <label class="label">
    isAdmin
    <input
      type="checkbox"
      class="checkbox checkbox-primary"
      bind:checked={isAdmin}
    />
  </label>
</section>

<ConfigMenu data={mockData({ isAdmin })} actions={mockActions} />
