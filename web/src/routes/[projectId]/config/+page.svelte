<script lang="ts">
  import ConfigMenu from "~/pages/config/page.svelte";
  import type { PageProps } from "./$types.ts";
  import {
    close,
    deleteProjectAction,
    reopen,
    updateProjectAction,
  } from "./actions.ts";

  const { data }: PageProps = $props();

  const actions = {
    updateProject: updateProjectAction,
    close,
    reopen,
    deleteProject: deleteProjectAction,
  };
</script>

<ConfigMenu getData={() => data} {actions} />
