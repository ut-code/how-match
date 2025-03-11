<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { generateURL } from "~/api/origins.svelte.ts";
  import MdiVote from "~icons/mdi/vote";
  import MdiStopCircle from "~icons/mdi/stop-circle";
  import MdiGraph from "~icons/mdi/graph";
  import MdiLink from "~icons/mdi/link-variant";

  import { toast } from "~/globals.svelte.js";
  import * as actions from "./actions.ts";

  const { data } = $props();

  onMount(() => {
    const newlyCreated = page.url.searchParams.get("created") !== null;
    const justClosed = page.url.searchParams.get("closed") !== null;
    if (newlyCreated) {
      toast.push({
        kind: "success",
        message: "プロジェクトを作成しました。",
        timeout: 2000,
      });
    }
    if (justClosed) {
      toast.push({
        kind: "success",
        message: "提出を締め切りました。",
        timeout: 2000,
      });
    }
    // replace ?created and ?closed with none s.t. it won't show "closed!" after reload
    const next = new URL(window.location.href);
    next.search = "";
    setTimeout(() => {
      replaceState(next, {});
    });
  });

  const link = generateURL({
    pathname: `${data.projectId}/submit`,
  }).href;

  let copied = $state(false);

  function sumRolesCount(
    participants: {
      id: string;
      name: string;
      is_admin: number;
      roles_count: number | null;
    }[],
  ) {
    let sum = 0;
    for (const participant of participants) {
      sum += participant.roles_count ?? 0;
    }
    return sum;
  }
</script>

<main class="hm-blocks-container">
  <div class="hm-block">
    {#await Promise.all([data.project, data.participants] as const)}
      <span class="loading loading-xl"> </span>
    {:then [projectRes, participants]}
      {#if !projectRes.ok}
        failed to load project. code: {projectRes.code}
        message: {projectRes.message}
      {:else}
        {@const project = projectRes.data.project}
        {@const alreadyClosed = project.closed_at !== null}
        {@const notEnoughPeople =
          participants.length === 0 || // would error
          projectRes.data.roles
            .map((role) => role.min)
            .reduce((a, b) => a + b) >
            (project.multiple_roles === 1
              ? sumRolesCount(participants)
              : participants.length)}
        {@const overCapacityPeople = // TODO: need to deel with exceeded constarints
          project.multiple_roles === 1 &&
          projectRes.data.roles
            .map((role) => role.max)
            .reduce((a, b) => a + b) < sumRolesCount(participants)}

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <h2 class="text-xl">{project.name}</h2>
            <p>{project.description}</p>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-sm text-gray-500">提出ページ</h3>
            <div class="flex gap-2">
              <label class="input input-bordered w-full rounded-xl bg-gray-50">
                <MdiLink
                  class="h-[1rem] opacity-50 select-none dark:text-white"
                />
                <input type="url" class="x-selectable" value={link} readonly />
              </label>
              {#if !copied}
                <button
                  class="btn btn-soft btn-primary w-17"
                  onclick={async () => {
                    await navigator.clipboard.writeText(link);
                    copied = true;
                    setTimeout(() => {
                      copied = false;
                    }, 2000);
                  }}
                >
                  copy
                </button>
              {:else}
                <button class="btn btn-soft btn-primary w-17" disabled>
                  copied!
                </button>
              {/if}
            </div>
            <div class="flex justify-end">
              <a
                class="btn btn-primary btn-soft"
                href="./submit"
                class:btn-disabled={alreadyClosed}
              >
                <MdiVote />
                参加者として提出する
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-sm text-gray-500">締切</h3>
            <p>
              {project.closed_at ?? "締切が設定されていません"}
            </p>
            <div class="flex justify-end">
              <div class="block">
                <button
                  class="btn btn-primary btn-soft"
                  disabled={alreadyClosed ||
                    notEnoughPeople ||
                    overCapacityPeople}
                  onclick={async () => {
                    await actions.close(data.projectId);
                  }}
                >
                  <MdiStopCircle />
                  今すぐ締め切る
                </button>
                <p>
                  {#if alreadyClosed}
                    <span class="validator-hint text-error text-sm">
                      既に締め切られています
                    </span>
                  {/if}
                  {#if notEnoughPeople}
                    <span class="validator-hint text-error text-xs">
                      参加者が不足しています
                    </span>
                  {/if}
                  {#if overCapacityPeople}
                    <span class="validator-hint text-error text-xs">
                      参加者が超過しています
                    </span>
                  {/if}
                </p>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-sm text-gray-500">一般</h3>
            <div class="flex justify-end gap-2">
              <button
                class="btn btn-error btn-outline"
                onclick={async () => {
                  await actions.deleteProject(data.projectId);
                }}
              >
                プロジェクトを削除
              </button>
              {#if project.closed_at}
                <a class="btn btn-primary" href={`/${project.id}/result`}>
                  <MdiGraph />
                  結果
                </a>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {:catch}
      プロジェクトの読み込みに失敗しました
    {/await}
  </div>
  {#await Promise.all([data.project, data.participants])}
    <span>
      <span class="loading loading-xl loading-bars"></span>
      読込中...
    </span>
  {:then [project, participants]}
    <ul class="list bg-base-100 rounded-box shadow-md">
      <li class="p-4 pb-2 text-xs tracking-wide opacity-60">提出した人</li>

      {#if !participants.length}
        <li class="list-row">
          <div
            class="list-col-grow border-b-base-200 text-xs font-semibold opacity-60"
          >
            提出者がいません
          </div>
        </li>
      {:else}
        {#each participants as participant}
          <li class="list-row">
            <div class="border-b-base-200 text-xs font-semibold opacity-60">
              {participant.name}
            </div>
            <div class="list-col-grow border-b-base-200 text-xs opacity-60">
              {#if !project.ok || project.data.project.multiple_roles}
                wants {participant.roles_count} roles
              {/if}
            </div>
            {#if participant.is_admin}
              <span class="badge badge-soft badge-info"> 管理者 </span>
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  {/await}
</main>
