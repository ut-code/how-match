<script lang="ts">
  import Header from "~/components/header.svelte";
  export let data: { projectId: string }; // TODO: 適切な型付け
  const shareUrl = data.projectId ? `http://localhost:5173/${data.projectId}/submit` : null; // TODO: 別箇所で設定可能にする
  let copied = false;
</script>

<div>
  <Header title="プロジェクトの作成" />
  <div class="hm-blocks-container">
    <p>プロジェクトが作成されました。</p>
    <div class="hm-block">
      <div class="flex gap-2">
        <input type="text" value={shareUrl} readonly class="input flex-1 bg-gray-50" />
        <button
          type="button"
          class="btn w-20"
          disabled={shareUrl === null}
          onclick={async () => {
            if (shareUrl) {
              await navigator.clipboard.writeText(shareUrl);
              copied = true;
            }
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  </div>
</div>
