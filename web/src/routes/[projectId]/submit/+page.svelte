<script lang="ts">
  import { goto } from "$app/navigation";
  import { PreferenceSchema } from "share/schema.ts";
  import { safeParse } from "valibot";
  import { createClient } from "~/api/client";
  import { generateURL } from "~/api/origins.svelte.ts";
  import type { PageProps } from "./$types.ts";
  import RolesSelector from "./roles-selector.svelte";

  const { data }: PageProps = $props();
  const client = createClient({ fetch });

  const project = data.project;
  // TODO: ローディング中の UI を追加
  let participantName = $state<string>(data.prev?.name ?? "");
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

    if (data.prev) {
      // PUT
      const res = await client.projects[":projectId"].preferences.$put({
        json: preference.output,
        param: { projectId: project.id },
      });
      if (!res.ok)
        throw new Error(
          `Failed to submit: got ${res.status} with text ${await res.text()}`,
        );
    } else {
      // POST
      const res = await client.projects[":projectId"].preferences.$post({
        json: preference.output,
        param: { projectId: project.id },
      });
      if (!res.ok)
        throw new Error(
          `Failed to submit: got ${res.status} with text ${await res.json()}`,
        );
    }
    goto("/done");
    formState = "done";
  }

  let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
  const closed = $derived.by(() => {
    if (data.project.closed_at === null) return false;
    return new Date(data.project.closed_at).getTime() < Date.now();
  });
  const formVerb = $derived(data.prev ? "更新" : "送信");

  const resultLink = $derived(
    generateURL({
      pathname: `${project.id}/result`,
    }).href,
  );
</script>

<div>
  {#if closed}
    <div role="alert" class="alert alert-error m-6">
      既に締め切られています
      <a class="btn btn-primary" href={resultLink}> 結果を見る </a>
    </div>
  {/if}
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
          <h2 class="text-xl">{project.name}</h2>
          {#if project.description}
            <p class="text-sm">{project.description}</p>
          {/if}
        </div>
        <div class="hm-block">
          <h2 class="text-xl">名前</h2>
          <input
            type="text"
            class="input bg-white text-base"
            placeholder="回答を入力"
            bind:value={participantName}
            disabled={closed}
          />
        </div>
        <RolesSelector bind:ratings {closed} />
        <div class="flex justify-end">
          {#if closed}
            <button type="submit" class="btn btn-primary" disabled>
              既に締め切られています
            </button>
          {:else if formState === "ready"}
            <button type="submit" class="btn btn-primary">
              {formVerb}
            </button>
          {:else if formState === "submitting"}
            <button type="submit" class="btn btn-primary" disabled>
              <span class="loading loading-spinner"></span>
              {formVerb}中...
            </button>
          {:else if formState === "error"}
            <button type="submit" class="btn btn-primary" disabled>
              <span class="loading loading-spinner"></span>
              {formVerb}に失敗しました
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
