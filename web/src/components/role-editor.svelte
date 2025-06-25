<script lang="ts">
  import type { SelectRole } from "share/schema.ts";
  import { Client } from "~/data/client.ts";
  import { modal, toast } from "~/globals.svelte.ts";
  import { proxify } from "~/lib/svutils.svelte.ts";
  import IconPlus from "~icons/fe/plus";
  import MdiClose from "~icons/mdi/close";
  type Props = {
    roles: SelectRole[];
    projectId: string;
  };
  const { roles, projectId }: Props = $props();

  function rolesToRolesEntry(roles: SelectRole[]) {
    return proxify(
      roles.map((role) => ({
        role,
        isNew: false,
      })),
    );
  }
  let newRoles = $state(rolesToRolesEntry(roles));
  let dirty = $state(false);

  // TODO: make this injectable
  async function save() {
    const request = {
      update: newRoles.filter((role) => !role.isNew).map((r) => r.role),
      create: newRoles.filter((role) => role.isNew).map((r) => r.role),
      delete: roles
        .filter((role) => !newRoles.some((r) => r.role.id === role.id))
        .map((r) => r.id),
    };
    try {
      const client = new Client(fetch);
      await client.updateRoles(projectId, request);
      toast.push({
        kind: "success",
        message: "Successfully updated roles!",
      });
    } catch (error) {
      console.error(error);
      toast.push({
        kind: "error",
        message: "Failed to update roles",
      });
    }
  }
  async function onDeleteRoleButtonClick(id: string) {
    await modal.show({
      title: "本当に役職を削除しますか？",
      content: "削除された役職に関する希望提出も同時に削除されます。",
      buttons: [
        { text: "キャンセル", class: "" },
        {
          text: "削除する",
          class: "btn-error",
          onclick: async () => {
            newRoles = newRoles.filter((r) => r.role.id !== id);
            dirty = true;
            console.log("deleting role...");
          },
        },
      ],
    });
  }
</script>

<form
  onsubmit={async (e) => {
    e.preventDefault();
    dirty = false;
    await save();
  }}
>
  <ul class="list bg-base-100 rounded-box">
    {#each newRoles as entry}
      <li class="list-row">
        <div class="lg:contents">
          <div class="list-col-grow">
            <input
              class="input validator w-full"
              required
              bind:value={
                () => entry.role.name,
                (v) => {
                  entry.role.name = v;
                  dirty = true;
                }
              }
            />
          </div>
          <label class="lg:fieldset-label my-2 block lg:my-0">
            Max
            <input
              class="input validator w-40"
              type="number"
              min={Math.max(1, entry.role.min)}
              bind:value={
                () => entry.role.max,
                (v) => {
                  entry.role.max = v;
                  dirty = true;
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
              max={entry.role.max}
              bind:value={
                () => entry.role.min,
                (v) => {
                  entry.role.min = v;
                  dirty = true;
                }
              }
            />
          </label>
          <button
            class="btn max-w-fit p-1"
            type="button"
            disabled={newRoles.length < 2}
            onclick={() => {
              onDeleteRoleButtonClick(entry.role.id);
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
          onclick={() =>
            newRoles.push({
              role: {
                name: "",
                min: 0,
                max: 0,
                id: "",
                projectId,
              },
              isNew: true,
            })}
        >
          <IconPlus />
          Create New Role
        </button>
      </div>
      <span class="list-col-grow"></span>
      <div>
        <button
          class="btn btn-error"
          disabled={!dirty}
          type="button"
          onclick={() => {
            newRoles = rolesToRolesEntry(roles);
            dirty = false;
          }}
        >
          Reset
        </button>
      </div>
      <div>
        <button
          class="btn btn-primary"
          disabled={!dirty || newRoles.some((e) => e.role.name.length === 0)}
          type="submit"
        >
          Save
        </button>
      </div>
    </li>
  </ul>
</form>
