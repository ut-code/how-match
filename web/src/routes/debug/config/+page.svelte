<script lang="ts">
  import ConfigMenu from "~/pages/config/page.svelte";
  import { mockActions, mockData } from "./mock.svelte.ts";

  let isAdmin = $state(true);
  const getData = () => mockData({ isAdmin });
</script>

<section class="bg-base-200 flex flex-col gap-5 p-4">
  <h1 class="text-2xl font-bold">Debugger Options</h1>
  <label class="label">
    isAdmin
    <input
      type="checkbox"
      class="toggle toggle-primary"
      bind:checked={isAdmin}
    />
  </label>
</section>

<ConfigMenu {getData} actions={mockActions} />
