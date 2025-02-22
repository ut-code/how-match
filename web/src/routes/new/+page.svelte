<script lang="ts">
  import { goto } from "$app/navigation";
  import { client } from "~/api/client";
  import Header from "~/components/header.svelte";
  import * as v from "valibot";

  let name = $state("");
  let inputs = $state<
    { name: string; max: number | undefined; min: number | undefined }[]
  >([{ name: "", max: undefined, min: undefined }]);

  function addInput() {
    inputs.push({ name: "", max: undefined, min: undefined });
  }
  function deleteInput(index: number) {
    inputs.splice(index, 1);
  }

  const InputSchema = v.array(
    v.object({
      name: v.pipe(v.string(), v.minLength(1)),
      max: v.pipe(v.number(), v.minValue(1)),
      min: v.pipe(v.number(), v.minValue(0)),
    }),
  );
  const ProjectSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1)),
    roles: InputSchema,
    description: v.string(),
  });

  async function postProject() {
    const project = v.parse(ProjectSchema, {
      name: name,
      roles: inputs,
      description: "", // TODO
    });
    const res = await client.projects.$post({
      json: project,
    });
    if (!res.ok) {
      throw new Error("could not create project");
    }
    return res.json();
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
          placeholder="プロジェクト名"
          bind:value={name}
        />
      </div>
      <div class="hm-block">
        <p>設定する役職</p>
        {#each inputs as input, index}
          <div class="flex gap-2">
            <input
              type="text"
              class="input bg-white validator"
              placeholder="役職名"
              minlength="1"
              required
              bind:value={input.name}
            />
            <input
              type="number"
              class="input bg-white validator"
              placeholder="最大人数"
              min={1}
              required
              bind:value={input.max}
            />
            <input
              type="number"
              class="input bg-white validator"
              placeholder="最小人数"
              min="0"
              max={input.max}
              required
              bind:value={input.min}
            />
            <button type="button" onclick={() => deleteInput(index)}>✖️</button>
          </div>
        {/each}
        <button
          type="button"
          class="btn btn-primary flex justify-center"
          onclick={addInput}
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
