<script lang="ts">
  import { goto } from "$app/navigation";
  import { InsertPreference } from "share/model/schema.ts";
  import { safeParse } from "valibot";
  import { createClient } from "~/api/client";
  import { generateURL } from "~/api/origins.svelte.ts";
  import type { PageProps } from "./$types.ts";
  import RolesSelector from "./roles-selector.svelte";
  import { toast } from "~/globals.svelte.ts";

  const { data }: PageProps = $props();
  const client = createClient({ fetch });

  // TODO: ローディング中の UI を追加
  let participantName = $state<string>(data.prev?.name ?? "");
  let rolesCount = $state<number>(data.prev?.rolesCount || 1); // including 0
  let ratings = $state(
    data.project.roles.map((role) => {
      const score = role.prev ?? undefined;
      return { role, score };
    }),
  );

  const prev_data = data.prev != null;
  const formVerb = $derived.by(() => {
    if (!prev_data) return "送信";
    if (!data.prev?.name) return "送信"; // admin & has not submitted
    return "更新";
  });
  async function postPreference() {
    formState = "submitting";
    try {
      const projectId = data.project.id;
      const preference = safeParse(InsertPreference, {
        participantName,
        rolesCount,
        ratings: ratings.map((rating) => ({
          roleId: rating.role.id,
          score: rating.score,
        })),
      });
      // TODO: handle it better
      if (!preference.success) {
        console.error(preference.issues);
        throw new Error("failed to validate preference");
      }

      if (prev_data) {
        // PUT
        console.log("doing a PUT");
        const res = await client.projects[":projectId"].preferences.$put({
          json: preference.output,
          param: { projectId },
        });
        if (!res.ok)
          throw new Error(
            `Failed to submit: got ${res.status} with text ${await res.text()}`,
          );
      } else {
        // POST
        console.log("doing a POST");
        const res = await client.projects[":projectId"].preferences.$post({
          json: preference.output,
          param: { projectId },
        });
        if (!res.ok)
          throw new Error(
            `Failed to submit: got ${res.status} with text ${await res.json()}`,
          );
      }
      goto(`/${projectId}/config`);
      formState = "done";
    } catch (err) {
      console.error(err);
      formState = "error";
      toast.push({
        message: "希望の提出に失敗しました",
        kind: "error",
      });
      setTimeout(() => {
        formState = "ready";
      }, 1000);
    }
  }

  let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
  const isClosed = $derived.by(() => {
    if (data.project.closedAt === null) return false;
    return new Date(data.project.closedAt).getTime() < Date.now();
  });
  const maxRoles = $derived(data.project.roles.length);

  const resultLink = $derived(
    generateURL({
      pathname: `${data.project.id}/result`,
    }).href,
  );
</script>

<div>
  {#if isClosed}
    <div role="alert" class="alert alert-error m-6">
      既に締め切られています
      <a class="btn btn-primary" href={resultLink}> 結果を見る </a>
    </div>
  {/if}
  {#if data.project === null}
    <div class="hm-blocks-container">
      <p>プロジェクトが見つかりませんでした</p>
    </div>
  {:else}
    {@const p = data.project}
    <form
      onsubmit={async (e) => {
        e.preventDefault();
        await postPreference();
      }}
    >
      <div class="hm-blocks-container">
        <div class="hm-block">
          <h2 class="text-xl">{p.name}</h2>
          {#if p.description}
            <p class="text-sm">{p.description}</p>
          {/if}
        </div>
        <div class="hm-block">
          <label class="text-xl" for="input-name">名前</label>
          <input
            id="input-name"
            type="text"
            class="input validator text-base"
            required
            minlength="1"
            bind:value={participantName}
            disabled={isClosed}
          />
        </div>
        {#if p.multipleRoles}
          <div class="hm-block">
            <h2 class="text-xl">配属される役職数の希望</h2>
            <input
              type="number"
              class="input validator text-base"
              bind:value={rolesCount}
              max={data.project.roles.length}
              disabled={isClosed}
            />
            <div class="w-full max-w-xs">
              <input
                bind:value={rolesCount}
                class="range range-primary"
                type="range"
                min="1"
                max={maxRoles}
                step="1"
              />
              <div class="mt-2 flex justify-between px-2.5 text-xs">
                {#each { length: maxRoles } as _}
                  <span class="select-none">|</span>
                {/each}
              </div>
              <div class="mt-2 flex justify-between px-2.5 text-xs">
                {#each Array.from( { length: maxRoles }, ).map((_, i) => i + 1) as val}
                  <span class="select-none">{val}</span>
                {/each}
              </div>
            </div>
          </div>
        {/if}
        <RolesSelector bind:ratings closed={isClosed} />
        <div class="flex justify-end">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isClosed || formState !== "ready"}
          >
            {#if isClosed}
              既に締め切られています
            {:else if formState === "ready"}
              {formVerb}
            {:else if formState === "submitting"}
              <span class="loading loading-spinner"></span>
              {formVerb}中...
            {:else if formState === "error"}
              {formVerb}に失敗しました
            {:else if formState === "done"}
              完了
            {/if}
          </button>
        </div>
      </div>
    </form>
  {/if}
</div>
