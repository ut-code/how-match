<script lang="ts">
  import MdiClose from "~icons/mdi/close";
  import MdiPlus from "~icons/mdi/plus";
  import { goto } from "$app/navigation";
  import { Project } from "share/schema";
  import { safeParse } from "valibot";
  import { type Client, createClient } from "~/api/client";

  const client: Client = createClient({ fetch });
  type Form = {
    name: string;
    description: string;
    multipleRoles: boolean;
    roles: {
      localId: number;
      name: string;
      max: number | undefined;
      min: number | undefined;
    }[];
  };
  type PostForm = {
    name: string;
    description: string;
    multipleRoles: number;
    roles: { name: string; max: number | undefined; min: number | undefined }[];
  };

  let localIdSeq = 0;
  const form = $state<Form>({
    name: "",
    description: "",
    multipleRoles: false,
    roles: [
      { localId: localIdSeq++, name: "", max: undefined, min: undefined },
    ],
  });
  const roleElements: HTMLInputElement[] = $state([]);

  function addRole() {
    form.roles.push({
      localId: localIdSeq++,
      name: "",
      max: undefined,
      min: undefined,
    });
    setTimeout(() => {
      roleElements.at(-1)?.focus();
    });
  }
  function deleteRole(index: number) {
    form.roles.splice(index, 1);
  }
  const multipleRolesIsInvalid = $derived(form.roles.length <= 1);
  const deleteRoleButtonDisabled = $derived(form.roles.length <= 1);

  let formState = $state<"ready" | "submitting" | "error" | "done">("ready");
  async function postProject() {
    formState = "submitting";
    if (multipleRolesIsInvalid) {
      form.multipleRoles = false;
    }
    try {
      let postForm: PostForm = {
        name: form.name,
        description: form.description,
        multipleRoles: form.multipleRoles ? 1 : 0,
        roles: form.roles,
      };
      const val = safeParse(Project, postForm);
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
          class="input text-base"
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
          class="input text-base"
          placeholder="説明"
          bind:value={form.description}
        />
      </div>
      <div class="hm-block">
        <h2 class="text-xl">設定する役職</h2>
        {#each form.roles as role, index (role.localId)}
          <div class="flex gap-2">
            <input
              type="text"
              class="input validator grow-1"
              placeholder="役職名"
              minlength="1"
              required
              bind:value={role.name}
              bind:this={roleElements[index]}
            />
            <input
              type="number"
              class="input validator"
              placeholder="最大人数"
              min={1}
              required
              bind:value={role.max}
            />
            <input
              type="number"
              class="input validator"
              placeholder="最小人数"
              min="0"
              max={role.max}
              required
              bind:value={role.min}
            />
            <button
              type="button"
              class="btn btn-circle btn-ghost"
              disabled={deleteRoleButtonDisabled}
              onclick={() => deleteRole(index)}
            >
              <MdiClose class="w-12" aria-label="delete" />
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
      <div class="hm-block">
        <div class="w-fit">
          <h2 class="text-xl">複数の役職につくことを許可する</h2>
          <input
            type="checkbox"
            class="checkbox checkbox-lg checkbox-primary mt-3 mr-auto ml-auto block"
            placeholder=""
            indeterminate={multipleRolesIsInvalid}
            bind:checked={form.multipleRoles}
          />
        </div>
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
