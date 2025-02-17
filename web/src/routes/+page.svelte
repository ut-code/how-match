<script lang="ts">
  import type { SelectAccount } from "service/db/schema";
  import { onMount } from "svelte";
  import { client } from "~/api/client.ts";
  import Header from "~/components/header.svelte";

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

<div class="container">
  <Header title="how-match" />
  <div class="mt-12 p-4">
    <h2 class="text-xl">pages</h2>
    <ul>
      <li>
        <a href="/new" class="link">new</a>
      </li>
      <li>
        created
      </li>
    </ul>
  </div>
</div>
