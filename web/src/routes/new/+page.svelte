<script lang="ts">
  import { goto } from "$app/navigation";
  import { ProjectSchema } from "share/schema";
  import { safeParse } from "valibot";
  import { type Client, createClient } from "~/api/client";
  import MdiPlus from "virtual:icons/mdi/plus";
  import MdiClose from "virtual:icons/mdi/close";

  const client: Client = createClient({ fetch });
  type Form = {
    name: string;
    description: string;
    multipleRoles: boolean;
    roles: { name: string; max: number | undefined; min: number | undefined }[];
  };
  type PostForm = {
    name: string;
    description: string;
    multipleRoles: number;
    roles: { name: string; max: number | undefined; min: number | undefined }[];
  };

  const form = $state<Form>({
    name: "",
    description: "",
    multipleRoles: false,
    roles: [{ name: "", max: undefined, min: undefined }],
  });

  function addRole() {
    form.roles.push({ name: "", max: undefined, min: undefined });
  }
  function deleteRole(index: number) {
    form.roles.splice(index, 1);
  }

  let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
  async function postProject() {
    try {
      formState = "submitting";
      let postForm: PostForm = {
        name: form.name,
        description: form.description,
        multipleRoles: form.multipleRoles ? 1 : 0,
        roles: form.roles,
      };
      const val = safeParse(ProjectSchema, postForm);
      if (!val.success) {
        const error = new Error(
          "[TODO: make it into the UI] Failed to validate schema, issues:",
        );
        console.error(error, val.issues);
        throw error;
      }
      const res = await client.projects.$post({
        json: val.output,
      });
      if (!res.ok) {
        throw new Error("failed to create project");
      }
      const project = await res.json();
      goto(`/${project.id}/config?created`);
      formState = "done";
    } catch (err) {
      console.error(err);
      formState = "error";
      setTimeout(() => {
        formState = "ready";
      }, 1500);
    }
  }
</script>

<div>
  <form
    method="POST"
    onsubmit={async (e) => {
      e.preventDefault();
      await postProject();
    }}
  >
    <div class="hm-blocks-container">
      <div class="hm-block">
        <h2 class="text-xl">プロジェクトのタイトル</h2>
        <input
          type="text"
          class="input bg-white text-base"
          required
          minlength="1"
          placeholder="タイトル"
          bind:value={form.name}
        />
      </div>
      <div class="hm-block">
        <h2 class="text-xl">プロジェクトの説明</h2>
        <input
          type="text"
          class="input bg-white text-base"
          placeholder="説明"
          bind:value={form.description}
        />
      </div>
      <div class="hm-block">
        <h2 class="text-xl">配属人数の指定</h2>
        <input
          type="checkbox"
          class=" bg-white text-base"
          placeholder=""
          bind:checked={form.multipleRoles}
        />
      </div>
      <div class="hm-block">
        <h2 class="text-xl">設定する役職</h2>
        {#each form.roles as role, index}
          <div class="flex gap-2">
            <input
              type="text"
              class="input bg-white validator text-base grow-1"
              placeholder="役職名"
              minlength="1"
              required
              bind:value={role.name}
            />
            <input
              type="number"
              class="input bg-white validator text-base"
              placeholder="最大人数"
              min={1}
              required
              bind:value={role.max}
            />
            <input
              type="number"
              class="input bg-white validator text-base"
              placeholder="最小人数"
              min="0"
              max={role.max}
              required
              bind:value={role.min}
            />
            <button
              type="button"
              class="btn btn-circle btn-ghost"
              onclick={() => deleteRole(index)}
            >
              <MdiClose class="w-12" />
            </button>
          </div>
        {/each}
        <button
          type="button"
          class="btn btn-primary btn-soft flex justify-center"
          onclick={addRole}
        >
          <MdiPlus />
          追加
        </button>
      </div>
      <div class="flex justify-end">
        {#if formState === "ready"}
          <button type="submit" class="btn btn-primary">作成</button>
        {:else if formState === "done"}
          <button type="submit" class="btn btn-primary" disabled>完了</button>
        {:else if formState === "submitting"}
          <button type="submit" class="btn btn-primary" disabled>
            <span class="loading loading-spinner"></span>
            作成中...
          </button>
        {:else if formState === "error"}
          <button type="submit" class="btn btn-error" disabled>
            <span class="text-error"> 作成に失敗しました。 </span>
          </button>
        {/if}
      </div>
    </div>
  </form>
</div>
