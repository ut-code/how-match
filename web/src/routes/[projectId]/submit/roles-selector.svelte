<script lang="ts">
  import type { Role } from "share/schema.ts";
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
  <div class="hm-block">
    <h2 class="text-xl">{role.name}</h2>
    <div class="grid grid-cols-7 justify-items-center gap-2 text-sm">
      <div></div>
      <div class="text-lg text-gray-500">1</div>
      <div class="text-lg text-gray-500">2</div>
      <div class="text-lg text-gray-500">3</div>
      <div class="text-lg text-gray-500">4</div>
      <div class="text-lg text-gray-500">5</div>
      <div></div>

      <div class="text-gray-500">希望しない</div>

      {@render radioButton(1)}
      {@render radioButton(2)}
      {@render radioButton(3)}
      {@render radioButton(4)}
      {@render radioButton(5)}

      <div class="text-gray-500">希望する</div>

      {#snippet radioButton(radioIndex: number)}
        <div class="inline-flex items-center">
          <label
            class="relative flex cursor-pointer items-center"
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
              class="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-slate-800 opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
            >
            </span>
          </label>
        </div>
      {/snippet}
    </div>
  </div>
{/each}
