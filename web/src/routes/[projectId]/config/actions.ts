import { Client } from "~/data/client.ts";
import { modal, toast } from "~/globals.svelte";

function invalidate() {
  // TODO: implement a proper reloading
  // biome-ignore lint/correctness/noSelfAssign: this causes a page reload
  document.location.href = document.location.href;
}

export async function close(projectId: string) {
  await modal.show({
    title: "提出を締め切りますか？",
    content: "締め切ると提出ができなくなり、マッチングが計算されます。",
    buttons: [
      {
        class: "btn-outline",
        text: "キャンセル",
      },
      {
        class: "btn-primary",
        text: "締め切る",
        onclick: async () => {
          const client = new Client(fetch);
          await client.finalizeProject(projectId);
          invalidate();
        },
      },
    ],
  });
}

export async function reopen(projectId: string) {
  await modal.show({
    title: "締め切りをキャンセルしますか？",
    content:
      "キャンセルすると、再び提出が可能になり、既存のマッチング結果は削除されます。",
    buttons: [
      {
        class: "btn-outline",
        text: "キャンセル",
      },
      {
        class: "btn-warning",
        text: "締め切りをキャンセル",
        onclick: async () => {
          const client = new Client(fetch);
          await client.reopenProject(projectId);
          invalidate();
        },
      },
    ],
  });
}

export async function deleteProjectAction(projectId: string) {
  await modal.show({
    title: "プロジェクトを削除しますか？",
    content: "削除すると、参加者の提出やマッチング結果も消去されます。",
    buttons: [
      { text: "キャンセル", class: "btn-outline" },
      {
        text: "削除",
        class: "btn-error",
        onclick: async () => {
          const client = new Client(fetch);
          const resp = await client.deleteProject(projectId);
          if (resp.ok) {
            toast.push({
              message: "プロジェクトを削除しました。",
              kind: "error",
              timeout: 4000,
            });
            invalidate();
          } else {
            toast.push({
              message: "削除に失敗しました",
              kind: "error",
            });
          }
        },
      },
    ],
  });
}

export async function updateProjectAction(
  projectId: string,
  name: string,
  description: string | null,
  options?: {
    dropTooManyRoles?: boolean;
    multipleRoles?: boolean;
  },
) {
  try {
    const client = new Client(fetch);
    await client.updateProject(projectId, {
      name,
      description: description ?? undefined,
      dropTooManyRoles: options?.dropTooManyRoles ?? undefined,
      multipleRoles: options?.multipleRoles ?? undefined,
    });
    toast.push({ kind: "success", message: "更新に成功しました" });
  } catch (_err) {
    toast.push({ kind: "error", message: "更新に失敗しました" });
  }
}
