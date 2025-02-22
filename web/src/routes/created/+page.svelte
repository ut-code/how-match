<script lang="ts">
  import { goto } from "$app/navigation";
  import { generateURL } from "~/api/origins.svelte";
  import Header from "~/components/header.svelte";
  const { data }: { data: { projectId: string } } = $props(); // TODO: 適切な型付け
  if (!data.projectId) {
    goto("/");
  }
  const shareUrl = generateURL({
    pathname: `${data.projectId}/submit`,
  });
  let copied = $state(false);
</script>

<div>
  <Header title="プロジェクトの作成" />
  <div class="hm-blocks-container">
    <p>プロジェクトが作成されました。</p>
    <div class="hm-block">
      <div class="flex gap-2">
        <input
          type="text"
          value={shareUrl}
          readonly
          class="input flex-1 bg-gray-50"
        />
        <button
          type="button"
          class="btn w-20"
          disabled={shareUrl === null}
          onclick={async () => {
            if (shareUrl) {
              await navigator.clipboard.writeText(shareUrl.href);
              copied = true;
              setTimeout(() => {
                copied = false;
              }, 1000);
            }
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  </div>
</div>
