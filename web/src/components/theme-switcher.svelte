<script lang="ts">
  import { PersistedState } from "runed";

  import Sun from "~icons/material-symbols/sunny-outline-rounded";
  import Moon from "~icons/material-symbols/moon-stars-outline-rounded";
  import { browser } from "$app/environment";

  const prefersDark =
    browser &&
    window.matchMedia != null &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  let darkChecked = new PersistedState("how-match:theme-is-dark", prefersDark);
</script>

<label class="swap swap-rotate">
  <input
    type="checkbox"
    class="theme-controller"
    value="dark"
    bind:checked={darkChecked.current}
  />
  <Sun class="swap-off h-10 w-10 fill-current" />
  <Moon class="swap-on h-10 w-10 fill-current" />
</label>
