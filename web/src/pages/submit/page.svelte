<script lang="ts">
  import type { SelectProject, SelectRole } from "share/schema";
  import { toast } from "~/globals.svelte.ts";
  import { useAuth } from "~/lib/auth-utils.svelte.ts";
  import { generateURL } from "~/lib/origins.svelte.ts";
  import { proxify } from "~/lib/svutils.svelte.ts";
  import RolesSelector from "~/routes/[projectId]/submit/roles-selector.svelte";

  type Props = {
    project: SelectProject;
    roles: SelectRole[];
    prevData?: {
      name: string;
      rolesCount: number;
      ratings: Record<string, number>;
    } | null;
    onsubmit: (data: {
      participantName: string;
      rolesCount: number;
      ratings: Record<string, number>;
    }) => Promise<void>;
  };

  const { project, roles, prevData, onsubmit }: Props = $props();

  const auth = useAuth();
  let participantName = $state<string>(prevData?.name ?? "");
  let rolesCount = $state<number>(prevData?.rolesCount || 1);
  let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
  let ratings = $derived(proxify(prevData?.ratings ?? {}));

  const prevDataExists = prevData != null;
  const formVerb = $derived.by(() => {
    if (!prevDataExists) return "送信";
    if (!prevData?.name) return "送信";
    return "更新";
  });

  async function handleSubmit() {
    formState = "submitting";
    try {
      await onsubmit({
        participantName,
        rolesCount,
        ratings,
      });
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

  const isClosed = $derived.by(() => {
    if (project.closedAt === null) return false;
    return new Date(project.closedAt).getTime() < Date.now();
  });
  const isLoggedIn = $derived(auth.user !== null);
  const canSubmit = $derived(isLoggedIn && !isClosed && formState === "ready");
  const maxRoles = $derived(roles.length);

  const resultLink = $derived(
    generateURL({
      pathname: `${project.id}/result`,
    }).href,
  );
</script>

<div>
  {#if isClosed}
    <div role="alert" class="alert alert-error m-6">
      既に締め切られています
      <a class="btn btn-primary" href={resultLink}> 結果を見る </a>
    </div>
  {:else if !isLoggedIn}
    <div role="alert" class="alert alert-warning m-6">
      提出するにはログインが必要です
      <a class="btn btn-primary" href="/signin"> ログイン </a>
    </div>
  {/if}

  <form
    onsubmit={async (e) => {
      e.preventDefault();
      await handleSubmit();
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
        <label class="text-xl" for="input-name">名前</label>
        <input
          id="input-name"
          type="text"
          class="input validator text-base"
          required
          minlength="1"
          bind:value={participantName}
          disabled={!canSubmit}
        />
      </div>

      {#if project.multipleRoles}
        <div class="hm-block">
          <h2 class="text-xl">配属される役職数の希望</h2>
          <input
            type="number"
            class="input validator text-base"
            bind:value={rolesCount}
            max={maxRoles}
            disabled={!canSubmit}
          />
          <div class="w-full max-w-xs">
            <input
              bind:value={rolesCount}
              class="range range-primary"
              type="range"
              min="1"
              max={maxRoles}
              step="1"
              disabled={!canSubmit}
            />
            <div class="mt-2 flex justify-between px-2.5 text-xs">
              {#each { length: maxRoles }}
                <span class="select-none">|</span>
              {/each}
            </div>
            <div class="mt-2 flex justify-between px-2.5 text-xs">
              {#each { length: maxRoles }, idx}
                <span class="select-none">{idx}</span>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <RolesSelector bind:ratings closed={!canSubmit} {roles} />

      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary" disabled={!canSubmit}>
          {#if !isLoggedIn}
            ログインが必要です
          {:else if isClosed}
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
</div>
