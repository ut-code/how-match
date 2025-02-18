<script lang="ts">
  import chain from "~/icons/Chain.svg";
  const { data } = $props();

  class Readonly<T> {
    #val: T;
    constructor(val: T) {
      this.#val = val;
    }
    get val() {
      return this.#val;
    }
  }

  // TODO: fix this
  const domain = "localhost:5173";
  const link = $derived(
    new Readonly(`https://${domain}/${data.projectId}/submit`),
  );
</script>

<div>
  <h1>設定</h1>
  <p>Project ID: {data.projectId}</p>
</div>

<a class="btn" href="./submit">提出する</a>

<label class="input input-bordered">
  <img alt="" src={chain} />
  提出用リンク
  <!-- TODO: output 専用だけど input タグでよい？ -->
  <input type="url" class="input input-bordered" bind:value={link.val} />
  <button>copy</button>
</label>
