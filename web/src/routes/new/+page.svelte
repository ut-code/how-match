<script lang="ts">
  // components
  import ProjectTitle from "./_components/ProjectTitle.svelte";
  import ProjectDescription from "./_components/ProjectDescription.svelte";
  import RolesList from "./_components/RolesList.svelte";
  import { FormController } from "./FormController.svelte.ts";

  const ctl = new FormController();
</script>

<div>
  <form
    method="POST"
    onsubmit={async (e) => {
      e.preventDefault();
      await ctl.postProject();
    }}
  >
    <div class="hm-blocks-container">
      <ProjectTitle bind:name={ctl.form.name} />
      <ProjectDescription bind:description={ctl.form.description} />
      <RolesList {ctl} />
      {@render AllowMultiRoleButton()}
      {@render SubmitButton()}
    </div>
  </form>
</div>

{#snippet AllowMultiRoleButton()}
  <div class="hm-block">
    <div class="w-fit">
      <h2 class="text-xl">複数の役職につくことを許可する</h2>
      <input
        type="checkbox"
        class="checkbox checkbox-lg checkbox-primary mt-3 mr-auto ml-auto block"
        indeterminate={ctl.multipleRolesIsInvalid}
        disabled={ctl.multipleRolesIsInvalid}
        bind:checked={ctl.form.multipleRoles}
      />
    </div>
  </div>
{/snippet}

{#snippet SubmitButton()}
  <div class="flex justify-end">
    {#if ctl.formState === "ready"}
      <button type="submit" class="btn btn-primary">作成</button>
    {:else if ctl.formState === "done"}
      <button type="submit" class="btn btn-primary" disabled>完了</button>
    {:else if ctl.formState === "submitting"}
      <button type="submit" class="btn btn-primary" disabled>
        <span class="loading loading-spinner"></span>
        作成中...
      </button>
    {:else if ctl.formState === "error"}
      <button type="submit" class="btn btn-error" disabled>
        <span class="text-error"> 作成に失敗しました。 </span>
      </button>
    {/if}
  </div>
{/snippet}
