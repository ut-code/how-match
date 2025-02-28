<script lang="ts">
import type { Role } from "share/types.ts";
type Props = {
  ratings: {
    role: Role;
    score: number | undefined;
  }[];
  closed: boolean;
};
const { ratings = $bindable(), closed }: Props = $props();
</script>

{#each ratings as rating, radioIndex (radioIndex)}
  {@const role = rating.role}
  <div
    class="hm-block"
  >
    <h3>役職：{role.name}</h3>
    <div
      class="gap-2 grid grid-cols-7 justify-items-center text-sm"
    >
      <div></div>
      <div class="text-lg">1</div>
      <div class="text-lg">2</div>
      <div class="text-lg">3</div>
      <div class="text-lg">4</div>
      <div class="text-lg">5</div>
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
              class="radio radio-lg"
              id="{role.name}-{radioIndex}"
              value={radioIndex}
              bind:group={rating.score}
              disabled={closed}
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
{/each}
