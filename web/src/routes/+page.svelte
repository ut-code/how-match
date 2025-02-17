<script lang="ts">
  import type { SelectAccount } from "service/db/schema";
  import { onMount } from "svelte";
  import { client } from "~/api/client.ts";

  let promise: Promise<SelectAccount[]> = $state(new Promise(() => {}));
  async function refetch() {
    promise = client.accounts.$get().then((it) => it.json());
  }
  onMount(refetch);

  let name = $state("");
  let age = $state(0);

  async function postUser() {
    await client.accounts.$post({
      json: {
        name,
      },
    });
    console.log("posted");
  }
</script>

<h1 class="text-2xl text-red-800">Add User!</h1>
<form
  method="POST"
  onsubmit={async (e) => {
    e.preventDefault();
    await postUser();
    await refetch();
  }}
>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">name</legend>
    <label class="input validator">
      <input type="name" name="name" bind:value={name} />
    </label>
  </fieldset>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">age</legend>
    <label class="input validator">
      <input type="number" name="age" bind:value={age} />
    </label>
  </fieldset>
  <button class="btn" type="submit">submit</button>
</form>

<h1>Users</h1>
<div>
  {#await promise}
    <span class="loading loading-infinity"></span>
  {:then users}
    {#each users as user}
      <div>Name: {user.name}</div>
    {/each}
  {/await}
</div>
