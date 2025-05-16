<script lang="ts">
  type Props = {
    name: string;
  };
  let { name = $bindable() }: Props = $props();
</script>

<div class="hm-block">
  <h2 class="text-xl">プロジェクトのタイトル</h2>
  <input
    type="text"
    class="input text-base"
    required
    minlength="1"
    placeholder="タイトル"
    bind:value={name}
  />
</div>
