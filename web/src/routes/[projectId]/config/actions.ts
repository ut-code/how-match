import { goto, replaceState } from "$app/navigation";
import { createClient } from "~/api/client";
import type { ModalClient } from "~/lib/messaging/modal/modal-controller.svelte";
import type { ToastClient } from "~/lib/messaging/toast/toast-controller.svelte";

const client = createClient({ fetch });

export class Actions {
  constructor(
    private modal: ModalClient,
    private toast: ToastClient,
  ) {}

  async close(projectId: string) {
    await this.modal.show({
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
  async deleteProject(projectId: string) {
    await this.modal.show({
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
              this.toast.push({
                message: "プロジェクトを削除しました。",
                kind: "success",
                timeout: 4000,
              });
              goto("/");
            } else {
              this.toast.push({
                message: "削除に失敗しました",
                kind: "error",
              });
            }
          },
        },
      ],
    });
  }

  async updateProject(
    projectId: string,
    name: string,
    description: string | null,
    options?: {
      dropTooManyRoles?: boolean;
      multipleRoles?: boolean;
    },
  ) {
    try {
      const resp = await client.projects[":projectId"].$patch({
        param: {
          projectId: projectId,
        },
        json: {
          project: {
            name,
            description: description ?? undefined,
            dropTooManyRoles: options?.dropTooManyRoles ?? undefined,
            multipleRoles: options?.multipleRoles ?? undefined,
          },
        },
      });
      if (!resp.ok) {
        throw new Error(
          `Got response status ${resp.status} with text ${await resp.text()}`,
        );
      }
      this.toast.push({ kind: "success", message: "更新に成功しました" });
    } catch (_err) {
      this.toast.push({ kind: "error", message: "更新に失敗しました" });
    }
  }
}
