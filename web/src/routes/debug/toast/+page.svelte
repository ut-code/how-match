<script lang="ts">
  import { toast } from "~/globals.svelte.ts";
  import { DEFAULT_TIMEOUT } from "~/providers/toast/toast-control.svelte";

  let timeout = $state(DEFAULT_TIMEOUT);

  const buttons = [
    {
      text: "success!",
      kind: "success",
      class: "btn-success",
    },
    {
      text: "error!",
      kind: "error",
      class: "btn-error",
    },
  ] as const;
</script>

<main class="mx-auto mt-100 flex max-w-sm flex-col gap-8">
  <fieldset class="fieldset border-base-300 rounded-xl border-2 p-4">
    <legend class="fieldset-legend"> Timeout </legend>
    <input
      class="range"
      min="0"
      max="10000"
      type="range"
      bind:value={timeout}
    />
    <input class="input" type="number" bind:value={timeout} />
  </fieldset>

  <div class="flex gap-4">
    {#each buttons as btn}
      <button
        class={["btn", btn.class]}
        onclick={() => {
          toast.push({
            kind: btn.kind,
            message: btn.text,
            timeout,
          });
        }}
      >
        {btn.text}
      </button>
    {/each}
  </div>
</main>
