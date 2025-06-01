<script lang="ts">
  import ConfigMenu from "~/pages/config/project-config.svelte";
  import type { PageProps } from "./$types.ts";
  import * as actions from "./actions.ts";

  const { data }: PageProps = $props();
</script>

<ConfigMenu getData={() => data} {actions} />
