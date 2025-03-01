<script lang="ts">
  import { replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { type Client, createClient } from "~/api/client";
  import { generateURL } from "~/api/origins.svelte.ts";
  import Header from "~/components/header.svelte";
  import chain from "~/icons/Chain.svg";
  import MdiVote from "virtual:icons/mdi/vote";
  import MdiStopCircle from "virtual:icons/mdi/stop-circle";
  import MdiGraph from "virtual:icons/mdi/graph";

  import Toast from "~/providers/toast/toast.svelte";
  import { ToastController } from "~/providers/toast/toast-control.svelte.ts";
  import { ModalController } from "~/providers/modal/modal-controller.svelte.js";
  import Modal from "~/providers/modal/modal.svelte";

  const client: Client = createClient({ fetch });
  const { data } = $props();
  const toasts = new ToastController();

  onMount(() => {
    const newlyCreated = page.url.searchParams.get("created") !== null;
    const justClosed = page.url.searchParams.get("closed") !== null;
    if (newlyCreated) {
      toasts.push({
        kind: "success",
        message: "プロジェクトを作成しました。",
        timeout: 2000,
      });
    }
    if (justClosed) {
      toasts.push({
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

  const modal = new ModalController();
</script>

<Header title="管理" />
<Toast {toasts} />
<Modal {modal} />

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
              {#if !copied}
                <button
                  class="btn btn-sm btn-soft btn-primary"
                  onclick={async () => {
                    await navigator.clipboard.writeText(link);
                    setTimeout(() => {
                      copied = false;
                    }, 2000);
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
                onclick={async () => {
                  await modal.show({
                    title: "提出を締め切りますか？",
                    content:
                      "締め切ると提出ができなくなり、マッチングが計算されます。",
                    buttons: [
                      {
                        class: "btn-outline",
                        text: "キャンセル",
                      },
                      {
                        class: "btn-primary",
                        text: "締め切る",
                        onclick: async () => {
                          await client.projects[":projectId"].finalize.$put({
                            param: {
                              projectId: data.projectId,
                            },
                          });
                          location.assign(`/${project.id}/config?closed`);
                        },
                      },
                    ],
                  });
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
                onclick={async () => {
                  await modal.show({
                    title: "プロジェクトを削除しますか？",
                    content:
                      "削除すると、参加者の提出やマッチング結果も消去されます。",
                    buttons: [
                      { text: "キャンセル", class: "btn-outline" },
                      {
                        text: "削除",
                        class: "btn-error",
                        onclick: async () => {
                          const resp = await client.projects[
                            ":projectId"
                          ].$delete({
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
                        },
                      },
                    ],
                  });
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
        </div>
      {/if}
    {:catch}
      プロジェクトの読み込みに失敗しました
    {/await}
  </div>
</main>
