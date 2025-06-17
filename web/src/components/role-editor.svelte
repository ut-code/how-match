<script lang="ts">
  import type {
    RoleController,
    RoleEditorEntry,
  } from "~/controllers/role-controller.svelte";
  import { useModal } from "~/lib/messaging/modal/modal-controller.svelte";
  import IconPlus from "~icons/fe/plus";
  import MdiClose from "~icons/mdi/close";

  type Props = {
    controller: RoleController;
    onsave: (() => void) | null;
  };
  let { controller, onsave }: Props = $props();

  const modal = useModal();
  async function onDeleteRoleButtonClick(role: RoleEditorEntry) {
    if ("id" in role) {
      await modal.show({
        title: "本当に役職を削除しますか？",
        content: "削除された役職に関する希望提出も同時に削除されます。",
        buttons: [
          { text: "キャンセル", class: "" },
          {
            text: "削除する",
            class: "btn-error",
            onclick: () => {
              controller.delete(role);
            },
          },
        ],
      });
    } else {
      controller.delete(role);
    }
  }
</script>

{#if onsave}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      onsave?.();
    }}
  >
    {@render Inner()}
  </form>
{:else}
  {@render Inner()}
{/if}

{#snippet Inner()}
  <ul class="list bg-base-100 rounded-box">
    {#each controller.roles as role}
      <li class="list-row">
        <div class="lg:contents">
          <div class="list-col-grow">
            <input
              class="input validator w-full"
              required
              bind:value={
                () => role.name,
                (v) => {
                  controller.editRole(role, { ...role, name: v });
                }
              }
            />
          </div>
          <label class="lg:fieldset-label my-2 block lg:my-0">
            Max
            <input
              class="input validator w-40"
              type="number"
              min={Math.max(1, role.min)}
              bind:value={
                () => role.max,
                (v) => {
                  controller.editRole(role, { ...role, max: v });
                }
              }
            />
          </label>
          <label class="lg:fieldset-label">
            Min
            <input
              class="input validator w-40"
              type="number"
              min={0}
              max={role.max}
              bind:value={
                () => role.min,
                (v) => {
                  controller.editRole(role, { ...role, min: v });
                }
              }
            />
          </label>
          <button
            class="btn max-w-fit p-1"
            type="button"
            disabled={controller.roles.length < 2}
            onclick={() => {
              onDeleteRoleButtonClick(role);
            }}
          >
            <MdiClose aria-label="Delete role" class="my-auto text-2xl" />
          </button>
        </div>
      </li>
    {/each}
    <li class="list-row">
      <div>
        <button
          class="btn btn-primary"
          type="button"
          aria-label="Create new Role"
          onclick={() => controller.addRole("")}
        >
          <IconPlus />
          Create New Role
        </button>
      </div>
      <span class="list-col-grow"></span>
      {#if onsave}
        <div>
          <button
            class="btn btn-error"
            disabled={!controller.dirty}
            type="button"
            onclick={() => {
              controller.reset();
            }}
          >
            Reset
          </button>
        </div>
        <div>
          <button
            class="btn btn-primary"
            disabled={!controller.dirty ||
              controller.roles.some((e) => e.name.length === 0)}
            type="submit"
          >
            Save
          </button>
        </div>
      {/if}
    </li>
  </ul>
{/snippet}
