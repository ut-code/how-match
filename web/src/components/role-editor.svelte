<script lang="ts">
  import type { Role, RoleWithId } from "share/types.ts";
  import { createClient } from "~/api/client";
  import { toast } from "~/globals.svelte.ts";
  import IconPlus from "~icons/fe/plus";

  const client = createClient({ fetch });

  let {
    roles = $bindable(),
    projectId,
  }: { roles: RoleWithId[]; projectId: string } = $props();

  let newRoles = $state(
    roles.map((role) => ({
      role,
      isNew: false,
    })),
  );
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
            class="input w-full"
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
      </li>
    {/each}
    <li class="list-row">
      <span class="list-col-grow"></span>
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
          Create New
        </button>
      </div>
      <div>
        <button class="btn btn-primary" disabled={!dirty} type="submit">
          Save
        </button>
      </div>
    </li>
  </ul>
</form>
