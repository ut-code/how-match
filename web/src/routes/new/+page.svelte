<script lang="ts">
  import Header from "~/components/header.svelte";

  let inputs = [{ role: "", max: "", min: "" }];

  function addInput() {
    inputs = [...inputs, { role: "", max: "", min: "" }];
  }
  function deleteInput(index: number) {
    inputs = inputs.filter((_, i) => i !== index);
  }
</script>

<div>
  <Header title="プロジェクトの作成" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>プロジェクト名</p>
      <input type="text" class="input bg-white" placeholder="プロジェクト名" />
    </div>
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>設定する役職</p>
      {#each inputs as input, index}
        <div class="flex gap-2">
          <input type="text" class="input bg-white" placeholder="役職名" bind:value={inputs[index].role} />
          <input type="number" class="input bg-white" placeholder="最大人数" bind:value={inputs[index].max} />
          <input type="number" class="input bg-white" placeholder="最小人数" bind:value={inputs[index].min} />
          <button type="button" on:click={() => deleteInput(index)}>
            ✖️
          </button>
        </div>
      {/each}
      <button type="button" class="btn btn-primary flex justify-center" on:click={addInput}>
        ＋追加
      </button>
    </div>
    <div class="flex justify-end">
      <button type="button" class="btn btn-primary">
        作成
      </button>
    </div>
  </div>
</div>
