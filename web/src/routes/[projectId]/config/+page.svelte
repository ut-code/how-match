<script lang="ts">
import { goto, replaceState } from "$app/navigation";
import { page } from "$app/state";
import { redirect } from "@sveltejs/kit";
import { onMount } from "svelte";
import { fly } from "svelte/transition";
import { type Client, createClient } from "~/api/client";
import { generateURL } from "~/api/origins.svelte.ts";
import Header from "~/components/header.svelte";
import chain from "~/icons/Chain.svg";

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

<div>
  <Header title="管理・設定" />
  <div class="hm-blocks-container">
    <div class="hm-block">
      {#await data.stream}
        <span class="loading loading-xl"> </span>
      {:then res}
        {#if !res.ok}
          failed to load project. code: {res.code}
          message: {res.message}
        {:else}
          {@const project = res.data.project}
          <h3>プロジェクトの詳細</h3>
          <p>プロジェクト名: {project.name}</p>
          <p>説明: {project.description}</p>
          <p>
            締め切り: {project.closed_at ?? "まだ締め切っていません"}
          </p>

          <label class="input input-bordered w-full">
            <img alt="" src={chain} class="h-[1rem] opacity-50 select-none" />
            <span class="select-none">提出用リンク</span>
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
          <!-- navigation -->
          <section>
            <div class="mt-6 ml-8">
              <a
                class="btn btn-outline m-4"
                href="./submit"
                class:btn-disabled={project.closed_at ? true : false}
              >
                提出の画面へ
              </a>
              <button
                class="btn btn-primary btn-soft m-4"
                disabled={project.closed_at ? true : false}
                onclick={() => {
                  closeModalShown = true;
                }}
              >
                締め切る
              </button>
              <button
                class="btn btn-error btn-outline m-4"
                onclick={() => {
                  removeModalShown = true;
                }}
              >
                削除
              </button>
            </div>
          </section>

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
        
        {/if}
      {:catch}
        プロジェクトの読み込みに失敗しました
      {/await}
    </div>
  </div>
</div>
