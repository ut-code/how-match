<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { generateURL } from "~/api/origins.svelte.ts";
  import MdiGraph from "~icons/mdi/graph";
  import MdiLink from "~icons/mdi/link-variant";
  import MdiStopCircle from "~icons/mdi/stop-circle";
  import MdiVote from "~icons/mdi/vote";

  import { toast } from "~/globals.svelte.js";
  import RoleEditor from "~/components/role-editor.svelte";
  import type { RoleWithId } from "share/schema.ts";
  import RoleList from "~/components/role-list.svelte";
  import type { Actions, PageData } from "./types.ts";

  type Props = {
    getData: () => PageData;
    actions: Actions;
  };
  const { getData, actions }: Props = $props();

  // why svelte? why not make $derived as reactive as $state?
  let data = $state($state.snapshot(getData()));
  $effect(() => {
    data = getData();
  });

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

  const link = $derived(
    generateURL({
      pathname: `${data.projectId}/submit`,
    }).href,
  );

  const project = $derived(data.project);
  const participants = $derived(data.participants);
  const canEdit = $derived(!!data.prev?.isAdmin);
  let roles = $derived<RoleWithId[]>(data.project.roles);
  let projectName = $derived<string>(project.name);
  let projectDescription = $derived<string | null>(project.description ?? null);
  let copied = $state(false);

  function sumRolesCount(
    participants: {
      id: string;
      name: string;
      isAdmin: number;
      rolesCount: number | null;
    }[],
  ) {
    let sum = 0;
    for (const participant of participants) {
      sum += participant.rolesCount ?? 1; // if null, it means multipleRoles is not enabled
    }
    return sum;
  }

  const alreadyClosed = $derived(project.closedAt !== null);
  const notEnoughPeople = $derived(
    data.participants.length === 0 || // would error
      roles.reduce((acc, cur) => acc + cur.min, 0) >
        sumRolesCount(data.participants),
  );
  const overCapacityPeople = $derived(
    roles.reduce((acc, cur) => acc + cur.max, 0) <
      sumRolesCount(data.participants),
  );
</script>

<main class="hm-blocks-container">
  <div class="hm-block">
    <section id="name" class="flex flex-col gap-2">
      {#if canEdit}
        <h2
          bind:textContent={projectName}
          contenteditable="plaintext-only"
          class="border-b-1 border-gray-300 p-1 text-xl transition-colors duration-200 hover:bg-gray-500/50"
          onblur={async (e) => {
            if (!projectName) return;
            await actions.updateProject(
              data.projectId,
              projectName,
              projectDescription,
            );
          }}
          onkeydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLElement)?.blur();
            }
          }}
        ></h2>
        <p
          bind:textContent={projectDescription}
          contenteditable="plaintext-only"
          class="border-b-1 border-gray-300 p-1 transition-colors duration-200 hover:bg-gray-500/50"
          onblur={async (e) => {
            if (!projectName) return;
            await actions.updateProject(
              data.projectId,
              projectName,
              projectDescription,
            );
          }}
        ></p>
      {:else}
        <h2
          class="hover:bg-base-300 border-b-1 border-gray-300 p-1 text-xl transition-colors duration-200"
        >
          {projectName}
        </h2>
        {#if projectDescription}
          <p class="border-b-1 border-gray-300 p-1">
            {projectDescription}
          </p>
        {/if}
      {/if}
    </section>
    <section id="submit" class="flex flex-col gap-2">
      <h3 class="text-pale text-sm">提出</h3>
      <div class="flex gap-2">
        <label class="input input-bordered w-full rounded-xl bg-gray-50">
          <MdiLink class="h-[1rem] opacity-50 select-none dark:text-white" />
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
    </section>
    <section id="roles" class="flex flex-col gap-2">
      <h3 class="text-pale text-sm">役職</h3>
      {#if canEdit}
        <RoleEditor {roles} projectId={project.id} />
      {:else}
        <RoleList {roles} />
      {/if}
    </section>
    <section id="deadline" class="flex flex-col gap-2">
      <h3 class="text-pale text-sm">締切</h3>
      <p>
        {project.closedAt ?? "締切が設定されていません"}
      </p>
      <div class={["flex justify-end", !canEdit && "invisible"]}>
        <div class="block">
          <button
            class="btn btn-primary btn-soft"
            disabled={alreadyClosed || notEnoughPeople || overCapacityPeople}
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
    </section>
    {#if canEdit}
      <section id="other" class="flex flex-col gap-2">
        <h3 class="text-pale text-sm">一般</h3>
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">複数の役職を許可する</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              bind:checked={
                () => project.multipleRoles,
                (val) => {
                  project.multipleRoles = val;
                  actions.updateProject(
                    data.projectId,
                    project.name,
                    project.description ?? null,
                    {
                      multipleRoles: project.multipleRoles,
                    },
                  );
                }
              }
            />
          </label>
        </div>
        {#if project.multipleRoles}
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">余剰な役職を自動的に削除する</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                bind:checked={
                  () => project.dropTooManyRoles,
                  (val) => {
                    project.dropTooManyRoles = val;
                    actions.updateProject(
                      data.projectId,
                      project.name,
                      project.description ?? null,
                      {
                        dropTooManyRoles: project.dropTooManyRoles,
                      },
                    );
                  }
                }
              />
            </label>
            <div class="label-text-alt text-gray-500">
              オンにすると、参加者の希望数合計より多い役職の定員がある場合、最も希望の少ない役職から順に削除されます。
            </div>
          </div>
        {/if}
        <div class="flex justify-end gap-2">
          <button
            class="btn btn-error btn-outline"
            onclick={async () => {
              await actions.deleteProject(data.projectId);
            }}
          >
            プロジェクトを削除
          </button>
          {#if project.closedAt}
            <a class="btn btn-primary" href={`/${project.id}/result`}>
              <MdiGraph />
              結果
            </a>
          {/if}
        </div>
      </section>
    {/if}
  </div>
  <section id="submissions" class="list bg-base-100 rounded-box shadow-md">
    <h2 class="p-4 pb-2 text-xs tracking-wide opacity-60">提出した人</h2>
    <ul class="list bg-base-100 rounded-box shadow-md">
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
              {#if project.multipleRoles}
                wants {participant.rolesCount} roles
              {/if}
            </div>
            {#if participant.isAdmin}
              <span class="badge badge-soft badge-info"> 管理者 </span>
            {/if}
          </li>
        {/each}
      {/if}
    </ul>
  </section>
</main>
