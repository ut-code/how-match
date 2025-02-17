<script lang="ts">
  import { client } from "~/api/client";
  import Header from "~/components/header.svelte";

  let name = $state("");
  let inputs = $state<{ name: string; max: number; min: number }[]>([{ name: "", max: 0, min: 0 }]);

  function addInput() {
    inputs.push({ name: "", max: 0, min: 0 });
  }
  function deleteInput(index: number) {
    inputs.splice(index, 1);
  }

  async function postProject() {
    const project = {
      name: name,
      roles: inputs,
      description: "",
    };
    await client.projects.$post({ json: project });
  }
</script>

<div>
  <Header title="プロジェクトの作成" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <form
      method="POST"
      onsubmit={async (e) => {
        e.preventDefault();
        await postProject();
      }}
    >
      <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
        <p>プロジェクト名</p>
        <input type="text" class="input bg-white" placeholder="プロジェクト名" bind:value={name} />
      </div>
      <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
        <p>設定する役職</p>
        {#each inputs as input, index}
          <div class="flex gap-2">
            <input
              type="text"
              class="input bg-white"
              placeholder="役職名"
              bind:value={input.name}
            />
            <input
              type="number"
              class="input bg-white"
              placeholder="最大人数"
              bind:value={input.max}
            />
            <input
              type="number"
              class="input bg-white"
              placeholder="最小人数"
              bind:value={input.min}
            />
            <button type="button" onclick={() => deleteInput(index)}>✖️</button>
          </div>
        {/each}
        <button type="button" class="btn btn-primary flex justify-center" onclick={addInput}>
          ＋追加
        </button>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="btn btn-primary">作成</button>
      </div>
    </form>
  </div>
</div>
