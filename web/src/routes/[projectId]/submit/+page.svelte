<script lang="ts">
  import Header from "~/components/header.svelte";
  import { goto } from "$app/navigation";
  import { client } from "~/api/client";
  import type { PageProps } from "./$types.ts";
  let { data }: PageProps = $props();

  let participantName = $state("");
  let ratings = $state<{ roleId: string; score: number }[]>([]);

  async function getProject() {
    const response = await client.projects[":projectId"].$get({
      param: { projectId: data.projectId },
    });
    return await response.json();
  }

  const project = getProject();

  async function postPreference() {
    const preference = {
      accountId: null,
      participantName: participantName,
      ratings: ratings,
    };
    const response = await client.projects[":projectId"].preferences.$post({
      json: preference,
      param: { projectId: data.projectId },
    });
    return response.json();
  }
</script>

<div>
  <Header title="希望の提出" />
  {#await project}
    <span class="loading loading-infinity"></span>
  {:then project}
    <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
      <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
        <h3>{project.name}</h3>
        <p class="text-sm">{project.description}</p>
      </div>
    </div>
    <form
      method="POST"
      onsubmit={async (e) => {
        e.preventDefault();
        const preference = await postPreference();
      }}
    >
      <div class="h-full bg-base-100 p-6 flex flex-col gap-4">
        <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
          <h3>名前</h3>
          <input type="text" class="input bg-white" placeholder="回答を入力" bind:value={participantName} />
        </div>
      </div>

      {#each project.role as role, roleIndex}
        {@render ratingSelector(role.name, roleIndex)}
      {/each}

      <div class="h-full bg-base-100 p-6 flex flex-col gap-4">
        <div class="flex justify-end">
          <button type="submit" class="btn btn-primary">
            送信
          </button>
        </div>
      </div>
    </form>
  {/await}
</div>

{#snippet ratingSelector(roleName: string, roleIndex: number)}
  <div class="h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <h3>役職：{roleName}</h3>
      <div class="gap-2 grid grid-cols-7 justify-items-center text-sm">
        <div></div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div></div>

        <div>希望しない</div>

        {@render radioButton(1)}
        {@render radioButton(2)}
        {@render radioButton(3)}
        {@render radioButton(4)}
        {@render radioButton(5)}

        <div>希望する</div>

        {#snippet radioButton(radioIndex: number)}
          <div class="inline-flex items-center">
            <label class="relative flex items-center cursor-pointer" for="{roleName}-{radioIndex}">
              <input
                name={roleName}
                type="radio"
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                id="{roleName}-{radioIndex}"
              >
              <span
                class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
              </span>
            </label>
          </div>
        {/snippet}
      </div>
    </div>
  </div>
{/snippet}
