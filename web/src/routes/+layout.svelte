<script lang="ts">
  import Header from "~/components/header.svelte";
  import { modal, toast } from "~/globals.svelte";
  import Modal from "~/providers/modal/modal.svelte";
  import Toast from "~/providers/toast/toast.svelte";
  import "../app.css";
  const { children } = $props();
</script>

<Header />
<Toast {toast} />
<Modal {modal} />

{@render children()}
