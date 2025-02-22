<script lang="ts">
  import { goto } from "$app/navigation";
  import { type Client, createClient } from "~/api/client";
  import Header from "~/components/header.svelte";
  import { safeParse } from "valibot";
  import { ProjectSchema } from "share/schema";

  const client: Client = createClient({ fetch });
  type Form = {
    name: string;
    description: string;
    roles: { name: string; max: number | undefined; min: number | undefined }[];
  };

  const form = $state<Form>({
    name: "",
    description: "",
    roles: [{ name: "", max: undefined, min: undefined }],
  });

  function addRole() {
    form.roles.push({ name: "", max: undefined, min: undefined });
  }
  function deleteRole(index: number) {
    form.roles.splice(index, 1);
  }

  async function postProject() {
    const val = safeParse(ProjectSchema, form);
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
    return await res.json();
  }
</script>

<div>
  <Header title="プロジェクトの作成" />
  <form
    method="POST"
    onsubmit={async (e) => {
      e.preventDefault();
      const project = await postProject();
      goto(`/created?projectId=${project.id}`);
    }}
  >
    <div class="hm-blocks-container">
      <div class="hm-block">
        <p>プロジェクト名</p>
        <input
          type="text"
          class="input bg-white"
          required
          minlength="1"
          placeholder="プロジェクト名"
          bind:value={form.name}
        />
      </div>
      <div class="hm-block">
        <p>プロジェクトの説明</p>
        <input
          type="text"
          class="input bg-white"
          placeholder="説明"
          bind:value={form.description}
        />
      </div>
      <div class="hm-block">
        <p>設定する役職</p>
        {#each form.roles as role, index}
          <div class="flex gap-2">
            <input
              type="text"
              class="input bg-white validator"
              placeholder="役職名"
              minlength="1"
              required
              bind:value={role.name}
            />
            <input
              type="number"
              class="input bg-white validator"
              placeholder="最大人数"
              min={1}
              required
              bind:value={role.max}
            />
            <input
              type="number"
              class="input bg-white validator"
              placeholder="最小人数"
              min="0"
              max={role.max}
              required
              bind:value={role.min}
            />
            <button type="button" onclick={() => deleteRole(index)}>✖️</button>
          </div>
        {/each}
        <button
          type="button"
          class="btn btn-primary flex justify-center"
          onclick={addRole}
        >
          ＋追加
        </button>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary">作成</button>
      </div>
    </div>
  </form>
</div>
