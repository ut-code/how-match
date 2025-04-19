<script lang="ts">
  import LaptopIcon from "~icons/fe/laptop";
  import SunIcon from "~icons/fe/sunny-o";
  import MoonIcon from "~icons/fe/moon";
  import { PersistedState } from "runed";
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
  $inspect(theme.current);
</script>

<div class="dropdown w-32">
  <button
    class="btn w-full text-left align-middle text-sm"
    popovertarget="theme-toggle-dropdown"
    popovertargetaction="toggle"
  >
    <span class="w-4">
      <Icon />
    </span>
    <span>{labels[theme.current]}</span>
  </button>

  <ul class="dropdown-content border-base-200 bg-base-100 w-40 border p-1">
    {#each themes as t}
      {#if /* TODO: after refining dark theme, set browser default as default */ t}
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
      {/if}
    {/each}
  </ul>
</div>
