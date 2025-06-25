<script lang="ts">
  import ConfigMenu from "~/pages/config/project-config.svelte";
  import type { PageProps } from "./$types.ts";
  import {
    close,
    reopen,
    deleteProjectAction,
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
