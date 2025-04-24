<script lang="ts">
  import type { RoleWithId } from "share/schema.ts";
  import { createClient } from "~/api/client";
  import { modal, toast } from "~/globals.svelte.ts";
  import IconPlus from "~icons/fe/plus";
  import MdiClose from "~icons/mdi/close";

  const client = createClient({ fetch });

  let {
    roles = $bindable(),
    projectId,
  }: { roles: RoleWithId[]; projectId: string } = $props();

  function rolesToRolesEntry(roles: RoleWithId[]) {
    return roles.map((role) => ({
      role: structuredClone($state.snapshot(role)),
      isNew: false,
    }));
  }
  let newRoles = $state(rolesToRolesEntry(roles));
  let dirty = $state(false);

  async function save() {
    const request = {
      update: newRoles.filter((role) => !role.isNew).map((r) => r.role),
      create: newRoles.filter((role) => role.isNew).map((r) => r.role),
      delete: roles
        .filter((role) => !newRoles.some((r) => r.role.id === role.id))
        .map((r) => r.id),
    };
    const resp = await client.projects[":projectId"].$patch({
      param: {
        projectId,
      },
      json: {
        roles: request,
      },
    });
    if (!resp.ok) return console.error(await resp.text());
    const json = await resp.json();
    if (!json.roles) return console.error("It did not return json.roles");
    newRoles = json.roles.map((role) => ({
      role,
      isNew: false,
    }));
    roles = json.roles;
    toast.push({
      kind: "success",
      message: "Successfully updated roles!",
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
        <label class="fieldset-label">
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
        <label class="fieldset-label">
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
          class="btn max-w-fit p-2"
          type="button"
          disabled={newRoles.length < 2}
          onclick={async () => {
            await modal.show({
              title: "本当に役職を削除しますか？",
              content: "削除された役職に関する希望提出も同時に削除されます。",
              buttons: [
                { text: "キャンセル", class: "" },
                {
                  text: "削除する",
                  class: "btn-error",
                  onclick: async () => {
                    newRoles = newRoles.filter(
                      (r) => r.role.id !== entry.role.id,
                    );
                    console.log("deleting role...");
                  },
                },
              ],
            });
          }}
        >
          <MdiClose aria-label="Delete role" class="my-auto text-2xl" />
        </button>
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
