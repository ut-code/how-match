import { goto, replaceState } from "$app/navigation";
import { createClient } from "~/api/client";
import { modal, toast } from "~/globals.svelte";

const client = createClient({ fetch });

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
          await client.projects[":projectId"].finalize.$put({
            param: {
              projectId,
            },
          });
          replaceState(`/${projectId}/config?closed`, {});
        },
      },
    ],
  });
}

export async function deleteProject(projectId: string) {
  await modal.show({
    title: "プロジェクトを削除しますか？",
    content: "削除すると、参加者の提出やマッチング結果も消去されます。",
    buttons: [
      { text: "キャンセル", class: "btn-outline" },
      {
        text: "削除",
        class: "btn-error",
        onclick: async () => {
          const resp = await client.projects[":projectId"].$delete({
            param: {
              projectId: projectId,
            },
          });
          if (resp.ok) {
            toast.push({
              message: "プロジェクトを削除しました。",
              kind: "error",
              timeout: 4000,
            });
            goto("/");
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

export async function updateProject(
  projectId: string,
  name: string,
  description: string | null,
) {
  try {
    const resp = await client.projects[":projectId"].$patch({
      param: {
        projectId: projectId,
      },
      json: {
        name,
        description,
      },
    });
    if (!resp.ok)
      throw new Error(
        `Got response status ${resp.status} with text ${await resp.text()}`,
      );
    toast.push({ kind: "success", message: "更新に成功しました" });
  } catch (err) {
    toast.push({ kind: "error", message: "更新に失敗しました" });
  }
}
