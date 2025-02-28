<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { type Client, createClient } from "~/api/client";
  import { generateURL } from "~/api/origins.svelte.ts";
  import Header from "~/components/header.svelte";
  import chain from "~/icons/Chain.svg";
  import MdiVote from "virtual:icons/mdi/vote";
  import MdiStopCircle from "virtual:icons/mdi/stop-circle";
  import MdiGraph from "virtual:icons/mdi/graph";

  const client: Client = createClient({ fetch });
  const { data } = $props();

  const newlyCreated = page.url.searchParams.get("created") !== null;
  const justClosed = page.url.searchParams.get("closed") !== null;
  let createdToastShown = $state(false);
  let closedToastShown = $state(false);
  let closeModalShown = $state(false);
  let removeModalShown = $state(false);

  onMount(() => {
    if (newlyCreated) {
      createdToastShown = true;
      // replace ?created with none s.t. it won't show "created!" after reload
      const next = new URL(window.location.href);
      next.search = "";
      setTimeout(() => {
        replaceState(next, {});
      });
      setTimeout(() => {
        createdToastShown = false;
      }, 2000);
    }
    if (justClosed) {
      closedToastShown = true;
      // replace ?closed with none s.t. it won't show "closed!" after reload
      const next = new URL(window.location.href);
      next.search = "";
      setTimeout(() => {
        replaceState(next, {});
      });
      setTimeout(() => {
        closedToastShown = false;
      }, 2000);
    }
  });

  const link = generateURL({
    pathname: `${data.projectId}/submit`,
  }).href;

  let copyTimeout = $state(0);
  onMount(() => {
    const id = setInterval(() => (copyTimeout > 0 ? copyTimeout-- : null), 100);
    return () => clearTimeout(id);
  });
</script>

<Header title="管理" />
<div class="mt-3 ml-3 toast-start toast-top absolute">
  {#if createdToastShown}
    <div class="alert alert-success z-31" transition:fly>
      <span class="z-31">プロジェクトを作成しました。</span>
    </div>
  {/if}
  {#if closedToastShown}
    <div class="alert alert-success z-31" transition:fly>
      <span class="z-31">提出を締め切りました。</span>
    </div>
  {/if}
</div>

<main class="hm-blocks-container">
  <div class="hm-block">
    {#await data.stream}
      <span class="loading loading-xl"> </span>
    {:then res}
      {#if !res.ok}
        failed to load project. code: {res.code}
        message: {res.message}
      {:else}
        {@const project = res.data.project}
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <h2 class="text-xl">{project.name}</h2>
            <p>{project.description}</p>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-gray-500 text-sm">提出ページ</h3>
            <label class="input input-bordered w-full">
              <img alt="" src={chain} class="h-[1rem] opacity-50 select-none" />
              <input type="url" class="x-selectable" value={link} readonly />
              {#if copyTimeout === 0}
                <button
                  class="btn btn-sm btn-soft btn-primary"
                  onclick={async () => {
                    await navigator.clipboard.writeText(link);
                    copyTimeout = 20;
                  }}
                >
                  copy
                </button>
              {:else}
                <button disabled>copied!</button>
              {/if}
            </label>
            <div class="flex justify-end">
              <a
                class="btn btn-primary btn-soft btn-sm"
                href="./submit"
                class:btn-disabled={project.closed_at ? true : false}
              >
                <MdiVote />
                参加者として提出する
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-gray-500 text-sm">締切</h3>
            <p>
              {project.closed_at ?? "まだ締め切っていません"}
            </p>
            <div class="flex justify-end">
              <button
                class="btn btn-primary btn-soft btn-sm"
                disabled={project.closed_at ? true : false}
                onclick={() => {
                  closeModalShown = true;
                }}
              >
                <MdiStopCircle />
                今すぐ締め切る
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <h3 class="text-gray-500 text-sm">一般</h3>
            <div class="flex justify-end gap-2">
              <button
                class="btn btn-error btn-outline btn-sm"
                onclick={() => {
                  removeModalShown = true;
                }}
              >
                プロジェクトを削除
              </button>
              {#if project.closed_at}
                <a
                  class="btn btn-primary btn-sm"
                  href={`/${project.id}/result`}
                >
                  <MdiGraph />
                  結果
                </a>
              {/if}
            </div>
          </div>

          {#if closeModalShown}
            <dialog class="modal z-10" open>
              <div class="modal-box border-1">
                <h3>提出を締め切りますか？</h3>
                <p>締め切ると提出ができなくなり、マッチングが計算されます。</p>
                <div class="modal-action flex gap-4 items-center">
                  <button
                    class="btn btn-outline"
                    onclick={() => {
                      closeModalShown = false;
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    class="btn btn-primary m-4"
                    onclick={async () => {
                      await client.projects[":projectId"].finalize.$put({
                        param: {
                          projectId: data.projectId,
                        },
                      });
                      location.assign(`/${project.id}/config?closed`);
                    }}
                    disabled={project.closed_at ? true : false}
                  >
                    締め切る
                  </button>
                </div>
              </div>
            </dialog>
          {/if}

          {#if removeModalShown}
            <dialog class="modal z-10" open>
              <div class="modal-box border-1">
                <h3>プロジェクトを削除しますか？</h3>
                <p>削除すると、参加者の提出やマッチング結果も消去されます。</p>
                <div class="modal-action flex gap-4 items-center">
                  <button
                    class="btn btn-outline"
                    onclick={() => {
                      removeModalShown = false;
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    class="btn btn-error m-4"
                    onclick={async () => {
                      const resp = await client.projects[":projectId"].$delete({
                        param: {
                          projectId: data.projectId,
                        },
                      });
                      if (resp.ok) {
                        alert("削除しました。");
                        location.assign("/");
                      } else {
                        alert("削除に失敗しました");
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            </dialog>
          {/if}
        </div>
      {/if}
    {:catch}
      プロジェクトの読み込みに失敗しました
    {/await}
  </div>
</main>
