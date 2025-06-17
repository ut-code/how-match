<script lang="ts">
  import "../app.css";

  import Header from "~/components/header.svelte";
  import ModalProvider from "~/lib/messaging/modal/modal-provider.svelte";
  import ToastProvider from "~/lib/messaging/toast/toast-provider.svelte";
  const { children } = $props();
</script>

<Header />
<ToastProvider>
  <ModalProvider>
    {@render children()}
  </ModalProvider>
</ToastProvider>
