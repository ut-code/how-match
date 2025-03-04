<script lang="ts">
  import Toast from "~/providers/toast/toast.svelte";

  import "../app.css";

  import { toast, modal } from "~/globals.svelte";
  import Header from "~/components/header.svelte";
  import Modal from "~/providers/modal/modal.svelte";
  const { children } = $props();
</script>

<Header />
<Toast {toast} />
<Modal {modal} />

{@render children()}
