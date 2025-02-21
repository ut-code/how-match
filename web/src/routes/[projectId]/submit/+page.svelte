<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "~/components/header.svelte";
  import { client } from "~/api/client";
  import type { PageProps } from "./$types.ts";
  let { data }: PageProps = $props();

  const project = data.project;
  // TODO: ローディング中の UI を追加

  let participantName = $state(project.name);
  let ratings = $state<{ roleId: string; score: number }[]>(
    Array.from(project.roles, (role) => ({ roleId: role.id, score: 0 })),
  );

  async function postPreference() {
    const preference = {
      accountId: null,
      participantName: participantName,
      ratings: ratings,
    };
    const response = await client.projects[":projectId"].preferences.$post({
      json: preference,
      param: { projectId: project.id },
    });
    return response.json();
  }
</script>

<div>
  <Header title="希望の提出" />
  {#if project === null}
    <div class="hm-blocks-container">
      <p>プロジェクトが見つかりませんでした</p>
    </div>
  {:else}
    <form
      method="POST"
      onsubmit={async (e) => {
        e.preventDefault();
        await postPreference();
        goto("/done");
      }}
    >
      <div class="hm-blocks-container">
        <div class="hm-block">
          <h3>{project.name}</h3>
          {#if project.description}
            <p class="text-sm">{project.description}</p>
          {/if}
        </div>
        <div class="hm-block">
          <h3>名前</h3>
          <input
            type="text"
            class="input bg-white"
            placeholder="回答を入力"
            bind:value={participantName}
          />
        </div>
        {#each project.roles as role, roleIndex}
          {@render ratingSelector(role.name, roleIndex)}
        {/each}
        <div class="flex justify-end">
          <button type="submit" class="btn btn-primary">送信</button>
        </div>
      </div>
    </form>
  {/if}
</div>

{#snippet ratingSelector(roleName: string, roleIndex: number)}
  <div class="hm-block">
    <div>
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
                value={radioIndex}
                bind:group={ratings[roleIndex].score}
              />
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
