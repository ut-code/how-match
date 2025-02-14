<script lang="ts">
  import Header from "~/components/header.svelte";
  import type { PageProps } from "./$types.ts";
  let { data }: PageProps = $props();
</script>

<div>
  <Header title="希望の提出" />
  <div class="mt-12 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <h3>プロジェクト名</h3>
      <p class="text-sm">プロジェクトの説明</p>
    </div>
  </div>
  <div class="mt-1 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <h3>名前</h3>
      <input type="text" class="input bg-white" placeholder="回答を入力" />
    </div>
  </div>
  <div class="mt-1 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <h3>役職：会計</h3>
      <div class="gap-2 grid grid-cols-7 justify-items-center text-sm">
        <div></div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div></div>

        <div>希望しない</div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="kaikei-one">
            <input
              name="kaikei"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="kaikei-one"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="kaikei-two">
            <input
              name="kaikei"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="kaikei-two"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="kaikei-three">
            <input
              name="kaikei"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="kaikei-hree"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="kaikei-four">
            <input
              name="kaikei"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="kaikei-four"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="kaikei-five">
            <input
              name="kaikei"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="kaikei-five"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div>希望する</div>
      </div>
    </div>
  </div>
  <div class="mt-1 h-full bg-base-100 p-6 flex flex-col gap-4">
    <div class="rounded-lg bg-white p-6 flex flex-col gap-2">
      <h3>役職：パ長</h3>
      <div class="gap-2 grid grid-cols-7 justify-items-center text-sm">
        <div></div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div></div>

        <div>希望しない</div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="pachou-one">
            <input
              name="pachou"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="pachou-one"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="pachou-two">
            <input
              name="pachou"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="pachou-two"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="pachou-three">
            <input
              name="pachou"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="pachou-three"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="pachou-four">
            <input
              name="pachou"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="pachou-four"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div class="inline-flex items-center">
          <label class="relative flex items-center cursor-pointer" for="pachou-five">
            <input
              name="pachou"
              type="radio"
              class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
              id="pachou-five"
            >
            <span
              class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
            </span>
          </label>
        </div>

        <div>希望する</div>
      </div>
    </div>
    <div class="flex justify-end">
      <button type="button" class="btn btn-primary">
        送信
      </button>
    </div>
  </div>
</div>
