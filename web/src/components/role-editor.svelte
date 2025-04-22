<script lang="ts">
  import type { RoleWithId } from "share/types.ts";
  import { createClient } from "~/api/client";
  import { toast } from "~/globals.svelte.ts";
  const client = createClient({ fetch });

  let {
    roles = $bindable(),
    projectId,
  }: { roles: RoleWithId[] | undefined; projectId: string } = $props();
  let dirty = $state(false);

  async function save() {
    const resp = await client.projects[":projectId"].$patch({
      param: {
        projectId,
      },
      json: {
        roles,
      },
    });
    toast.push({
      kind: "success",
      message: "Successfully updated roles!",
    });
    console.log(await resp.json());
  }
</script>

<form
  onsubmit={async (e) => {
    e.preventDefault();
    await save();
  }}
>
  <ul class="list bg-base-100 rounded-box">
    {#if roles}
      {#each roles as role}
        <li class="list-row">
          <div class="list-col-grow">
            <input
              class="input w-full"
              bind:value={
                () => role.name,
                (v) => {
                  role.name = v;
                  dirty = true;
                }
              }
            />
          </div>
          <label class="fieldset-label">
            Max
            <input
              class="input w-40"
              type="number"
              bind:value={
                () => role.max,
                (v) => {
                  role.max = v;
                  dirty = true;
                }
              }
            />
          </label>
          <label class="fieldset-label">
            Min
            <input
              class="input w-40"
              type="number"
              bind:value={
                () => role.min,
                (v) => {
                  role.max = v;
                  dirty = true;
                }
              }
            />
          </label>
        </li>
      {/each}
    {:else}
      <span class="loading loading-bars"></span>
    {/if}
    <li class="list-row">
      <span class="list-col-grow"></span>
      <div>
        <button class="btn btn-primary" disabled={!dirty} type="submit">
          Save
        </button>
      </div>
    </li>
  </ul>
</form>
