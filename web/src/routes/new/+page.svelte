<script lang="ts">
  // components
  import ProjectTitle from "./_components/title.svelte";
  import ProjectDescription from "./_components/description.svelte";
  import RolesList from "./_components/roles-list.svelte";
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
      {@render DropTooManyRolesButton()}
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

{#snippet DropTooManyRolesButton()}
  {#if ctl.form.multipleRoles && !ctl.multipleRolesIsInvalid}
    <div class="hm-block">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">余剰な役職を自動的に削除する</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={ctl.form.dropTooManyRoles}
          />
        </label>
        <span class="label-text-alt text-gray-500">
          オンにすると、参加者の希望数合計より多い役職の定員がある場合、最も希望の少ない役職から順に削除されます。
        </span>
      </div>
    </div>
  {/if}
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
