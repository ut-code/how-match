<script lang="ts">
import type { Role } from "share/types.ts";
type Props = {
  ratings: {
    role: Role;
    score: number | undefined;
  }[];
};
const { ratings = $bindable() }: Props = $props();
</script>

{#each ratings as rating, radioIndex (radioIndex)}
  {@const role = rating.role}
  <div class="hm-block">
    <div>
      <h3>役職：{role.name}</h3>
      <div class="gap-2 grid grid-cols-7 justify-items-center text-sm">
        <div></div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <div></div>

        <div>希望しない</div>

        {@render radioButton(1)}
        {@render radioButton(2)}
        {@render radioButton(3)}
        {@render radioButton(4)}
        {@render radioButton(5)}

        <div>希望する</div>

        {#snippet radioButton(radioIndex: number)}
          <div class="inline-flex items-center">
            <label
              class="relative flex items-center cursor-pointer"
              for="{role.name}-{radioIndex}"
            >
              <input
                name={role.name}
                type="radio"
                required
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                id="{role.name}-{radioIndex}"
                value={radioIndex}
                bind:group={rating.score}
              />
              <span
                class="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
              </span>
            </label>
          </div>
        {/snippet}
      </div>
    </div>
  </div>
{/each}
