<script lang="ts">
  let a = $state("");
  $effect(() => {
    document.title = a;
  });
</script>

<h1 class="text-2xl text-red-800">Hello!</h1>
<fieldset class="fieldset">
  <legend class="fieldset-legend">Email</legend>
  <label class="input validator">
    <input type="name" />
    <span class="label">.github.io</span>
  </label>
  <p class="fieldset-label">You can edit page title later on from settings</p>
</fieldset>
