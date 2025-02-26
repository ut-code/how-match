<script lang="ts">
import { goto } from "$app/navigation";
import { PreferenceSchema } from "share/schema.ts";
import type { Preference } from "share/types.ts";
import { safeParse } from "valibot";
import { createClient } from "~/api/client";
import Header from "~/components/header.svelte";
import type { PageProps } from "./$types.ts";
import RolesSelector from "./roles-selector.svelte";

const { data }: PageProps = $props();
const client = createClient({ fetch });

const project = data.project;
// TODO: ローディング中の UI を追加
let participantName = $state<string>(data.prev?.name ?? "default username"); // ?
let ratings = $state(
  data.roles.map((role) => {
    const score = role.prev ?? undefined;
    return { role, score };
  }),
);

async function postPreference() {
  formState = "submitting";

  const preference = safeParse(PreferenceSchema, {
    browserId: null,
    participantName: participantName,
    ratings: ratings.map((rating) => ({
      roleId: rating.role.id,
      score: rating.score,
    })),
  });
  // TODO: handle it better
  if (!preference.success) throw new Error("failed to validate preference");

  let created: { ok: boolean };
  if (data.prev) {
    // PUT
    const res = await client.projects[":projectId"].preferences.$put({
      json: preference.output,
      param: { projectId: project.id },
    });
    created = await res.json();
  } else {
    // POST
    const res = await client.projects[":projectId"].preferences.$post({
      json: preference.output,
      param: { projectId: project.id },
    });
    created = await res.json();
  }
  goto("/done");
  formState = "done";
}

let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
const formVerb = $derived(data.prev ? "更新" : "送信");
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
          {#if formState === "ready"}
            <button type="submit" class="btn btn-primary">
              {formVerb}
            </button>
          {:else if formState === "submitting"}
            <button type="submit" class="btn btn-primary" disabled>
              <span class="loading loading-spinner"></span> {formVerb}中...
            </button>
          {:else if formState === "error"}
            <button type="submit" class="btn btn-primary" disabled>
              <span class="loading loading-spinner"></span> {formVerb}に失敗しました
            </button>
          {:else if formState === "done"}
            <button type="submit" class="btn btn-primary" disabled>
              完了
            </button>
          {/if}
        </div>
      </div>
    </form>
  {/if}
</div>
