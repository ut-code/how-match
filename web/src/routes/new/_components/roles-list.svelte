<script lang="ts">
  import MdiClose from "~icons/mdi/close";
  import MdiPlus from "~icons/mdi/plus";

  import type { FormController } from "../FormController.svelte.ts";

  type Props = {
    ctl: FormController;
  };
  const { ctl }: Props = $props();

  let bulkMax = $state<number | undefined>(undefined);
  let bulkMin = $state<number | undefined>(undefined);
</script>

<div class="hm-block">
  <h2 class="text-xl">設定する役職</h2>
  {#each ctl.form.roles as role, index (role.localId)}
    <div class="flex gap-2">
      <input
        type="text"
        class="input validator grow-1"
        placeholder="役職名"
        minlength="1"
        required
        bind:value={role.name}
        bind:this={ctl.roleElements[index]}
      />
      <input
        type="number"
        class="input validator"
        placeholder="最大人数"
        min={1}
        required
        bind:value={role.max}
      />
      <input
        type="number"
        class="input validator"
        placeholder="最小人数"
        min="0"
        max={role.max}
        required
        bind:value={role.min}
      />
      <button
        type="button"
        class="btn btn-circle btn-ghost"
        disabled={ctl.deleteRoleButtonDisabled}
        onclick={() => ctl.deleteRole(index)}
      >
        <MdiClose class="w-12" aria-label="delete" />
      </button>
    </div>
  {/each}
  {#if ctl.form.roles.length >= 2}
    <div class="flex justify-end gap-2">
      <p class="grow-1 self-center text-right text-gray-400">一括入力</p>
      <input
        type="number"
        class="input validator"
        placeholder="最大人数"
        min={1}
        bind:value={bulkMax}
        oninput={() => {
          if (bulkMax === undefined || bulkMax < 1) return;
          ctl.setBulkMax(bulkMax);
        }}
      />
      <input
        type="number"
        class="input validator mr-12"
        placeholder="最小人数"
        min="0"
        bind:value={bulkMin}
        oninput={() => {
          if (bulkMin === undefined || bulkMin < 0) return;
          ctl.setBulkMin(bulkMin);
        }}
      />
    </div>
  {/if}
  <button
    type="button"
    class="btn btn-primary btn-soft flex justify-center"
    onclick={ctl.addRole}
  >
    <MdiPlus />
    追加
  </button>
</div>
