import { goto } from "$app/navigation";
import { createClient } from "~/api/client";
import { RoleController } from "./role-controller.svelte.ts";

export type Form = {
  name: string;
  description: string;
  multipleRoles: boolean;
  dropTooManyRoles: boolean;
};
const client = createClient({ fetch });

export class ProjectCreator {
  form = $state<Form>({
    name: "",
    description: "",
    multipleRoles: false,
    dropTooManyRoles: true,
  });
  roles = new RoleController([]);
  multipleRolesIsInvalid = $derived(this.roles.roles.length <= 1);
  deleteRoleButtonDisabled = $derived(this.roles.roles.length <= 1);
  formState = $state<"ready" | "submitting" | "error" | "done">("ready");

  submit = async () => {
    if (this.formState === "submitting") return;
    this.formState = "submitting";

    try {
      const roles = this.roles.commit().create.map((r) => ({
        name: r.name,
        max: r.max,
        min: r.min,
      }));

      const data = {
        name: this.form.name,
        description: this.form.description,
        multipleRoles: this.form.multipleRoles,
        dropTooManyRoles: this.form.dropTooManyRoles,
        roles,
      };

      const res = await client.projects.$post({
        json: data,
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        this.formState = "error";
        return;
      }

      const { id } = await res.json();
      this.formState = "done";
      goto(`/${id}/config`);
    } catch (e) {
      console.error(e);
      this.formState = "error";
    }
  };
}
