<script lang="ts">
  import type { ModalController } from "./modal-controller.svelte.ts";

  type Props = { modal: ModalController };
  const { modal: ctrl }: Props = $props();
  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (ctrl.shown) {
      dialog?.showModal();
    }
  });
</script>

<dialog
  class="modal"
  bind:this={dialog}
  onclose={() => {
    ctrl.close();
  }}
>
  <div class="modal-box border-1">
    <h1>{ctrl.current?.title}</h1>
    <p>{ctrl.current?.content}</p>
    <div class="modal-action flex items-center gap-4">
      <form method="dialog">
        {#each ctrl.current?.buttons ?? [] as button}
          <button
            class="btn {button.class} m-4"
            onclick={async () => {
              await button.onclick?.();
            }}
          >
            {button.text}
          </button>
        {/each}
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
