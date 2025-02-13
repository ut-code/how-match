<script>
  import Header from "~/components/header.svelte";
</script>
<div>
  <Header title="プロジェクトの作成" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <p>sample</p>
      <input type="text" class="input bg-white" placeholder="sample" />
    </div>
    <div class="flex justify-end">
      <button type="button" class="btn btn-primary">
        作成
      </button>
    </div>
  </div>
</div>
