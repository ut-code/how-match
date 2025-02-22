<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "~/components/header.svelte";
  import { createClient } from "~/api/client";
  import type { PageProps } from "./$types.ts";
  import RolesSelector from "./roles-selector.svelte";
  import { PreferenceSchema } from "share/schema.ts";
  import { safeParse } from "valibot";

  const { data }: PageProps = $props();
  const client = createClient({ fetch });

  const project = data.project;
  // TODO: ローディング中の UI を追加
  let participantName = $state(project.name); // ?
  let ratings = $state(
    project.roles.map((role) => {
      const score = undefined as undefined | number;
      return { role, score: score };
    }),
  );

  async function postPreference() {
    const preference = safeParse(PreferenceSchema, {
      accountId: null, // ?
      participantName: participantName,
      ratings: ratings.map((rating) => ({
        roleId: rating.role.id,
        score: rating.score,
      })),
    });
    // TODO: handle it better
    if (!preference.success) throw new Error("failed to validate preference");
    const res = await client.projects[":projectId"].preferences.$post({
      json: preference.output,
      param: { projectId: project.id },
    });
    return await res.json();
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
        <RolesSelector bind:ratings />
        <div class="flex justify-end">
          <button type="submit" class="btn btn-primary">送信</button>
        </div>
      </div>
    </form>
  {/if}
</div>
