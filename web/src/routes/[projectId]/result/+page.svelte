<script lang="ts">
  import type { PageProps } from "./$types.ts";
  let { data }: PageProps = $props();
  import Header from "~/components/header.svelte";
</script>

<style>
  .example2 {
    list-style: disc;
  }
</style>

<div>
  <Header title="sample役職決定" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>sample役職決定</p>
      <h1>今年は以下の役職を募集しました。</h1>
      <ul class="example2">
        <li>sample</li>
        <li>sample2</li>
      </ul>
    </div>
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>sample</p>
      <input type="text" class="input bg-white" placeholder="sample" />
      <input type="text" class="input bg-white" placeholder="sample" />
    </div>
    <div class="flex justify-start">
      <button type="button" class="btn btn-primary">
        戻る
      </button>
    </div>
  </div>
</div>
