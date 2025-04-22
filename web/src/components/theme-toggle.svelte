<script lang="ts">
  import { PersistedState } from "runed";
  import LaptopIcon from "~icons/fe/laptop";
  import MoonIcon from "~icons/fe/moon";
  import SunIcon from "~icons/fe/sunny-o";
  const theme = new PersistedState<(typeof themes)[number]>(
    "how-match:theme-preference",
    "",
  );

  const themes = ["", "light", "dark"] as const;
  const labels = {
    "": "Auto",
    light: "Light",
    dark: "Dark",
  };
  const icons = {
    "": LaptopIcon,
    light: SunIcon,
    dark: MoonIcon,
  };
  const Icon = $derived(icons[theme.current]);
</script>

<div class="dropdown dropdown-end w-8 sm:w-32">
  <button class="btn w-full text-left align-middle text-sm">
    <span class="w-4">
      <Icon />
    </span>
    <span class="hidden sm:block">{labels[theme.current]}</span>
  </button>

  <ul class="dropdown-content border-base-300 bg-base-200 w-40 border p-1">
    {#each themes as t}
      <li>
        <input
          type="radio"
          name="theme"
          class="theme-controller btn btn-block btn-sm justify-start"
          aria-label={labels[t]}
          value={t}
          bind:group={theme.current}
        />
      </li>
    {/each}
  </ul>
</div>
