import { goto } from "$app/navigation";
import { panic } from "share/lib";
import { InsertProject } from "share/schema";
import { safeParse } from "valibot";
import { Client } from "~/data/client.ts";

export type Form = {
  name: string;
  description: string;
  multipleRoles: boolean;
  dropTooManyRoles: boolean;
  roles: {
    localId: number;
    name: string;
    max: number | undefined;
    min: number | undefined;
  }[];
};

let localIdSeq = 0;

export class FormController {
  form = $state<Form>({
    name: "",
    description: "",
    multipleRoles: false,
    dropTooManyRoles: true,
    roles: [
      { localId: localIdSeq++, name: "", max: undefined, min: undefined },
    ],
  });
  roleElements: HTMLInputElement[] = $state([]);
  multipleRolesIsInvalid = $derived(this.form.roles.length <= 1);
  deleteRoleButtonDisabled = $derived(this.form.roles.length <= 1);
  formState = $state<"ready" | "submitting" | "error" | "done">("ready");

  addRole = () => {
    this.form.roles.push({
      localId: localIdSeq++,
      name: "",
      max: undefined,
      min: undefined,
    });
    setTimeout(() => {
      this.roleElements.at(-1)?.focus();
    });
  };
  deleteRole = (index: number) => {
    this.form.roles.splice(index, 1);
  };

  postProject = async () => {
    this.formState = "submitting";
    if (this.multipleRolesIsInvalid) {
      this.form.multipleRoles = false;
    }
    try {
      const postForm: InsertProject = {
        name: this.form.name,
        description: this.form.description,
        multipleRoles: this.form.multipleRoles,
        dropTooManyRoles: this.form.dropTooManyRoles,
        roles: this.form.roles.map((role) => ({
          name: role.name,
          max: role.max ?? panic("max not specified"),
          min: role.min ?? panic("min not specified"),
        })),
      };
      const val = safeParse(InsertProject, postForm);
      if (!val.success) {
        const error = new Error(
          "[TODO: make it into the UI] Failed to validate schema, issues:",
        );
        console.error(error, val.issues);
        throw error;
      }
      const client = new Client(fetch);
      const { projectId } = await client.createProject(postForm);
      goto(`/${projectId}/config?created`);
      this.formState = "done";
    } catch (err) {
      console.error(err);
      this.formState = "error";
      setTimeout(() => {
        this.formState = "ready";
      }, 1500);
    }
  };
}
