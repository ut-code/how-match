<script lang="ts">
  import type { PageProps } from "./$types.ts";
  let { data }: PageProps = $props();
</script>

<div>
  <h1>結果</h1>
  <p>Project ID: {data.projectId}</p>
</div>
