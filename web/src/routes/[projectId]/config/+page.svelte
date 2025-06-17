<script lang="ts">
  import { useModal } from "~/lib/messaging/modal/modal-controller.svelte.ts";
  import { useToast } from "~/lib/messaging/toast/toast-controller.svelte.ts";
  import ConfigMenu from "~/pages/config/project-config.svelte";
  import type { PageProps } from "./$types.ts";
  import { Actions } from "./actions.ts";

  const modal = useModal();
  const toast = useToast();
  const actions = new Actions(modal, toast);

  const { data }: PageProps = $props();
</script>

<ConfigMenu getData={() => data} {actions} />
