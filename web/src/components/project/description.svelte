<script lang="ts">
  type Props = {
    description: string;
  };
  let { description = $bindable() }: Props = $props();
</script>

<div class="hm-block">
  <h2 class="text-xl">プロジェクトの説明</h2>
  <input
    type="text"
    class="input text-base"
    placeholder="説明"
    bind:value={description}
  />
</div>
