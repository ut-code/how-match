import type { Role, RoleWithId } from "share/schema";
interface RoleWithLocalId extends Role {
  localId: number;
}

export type RoleEditorEntry = RoleWithLocalId | RoleWithId;

export class RoleController {
  private createRoles = $state<RoleWithLocalId[]>([]);
  private _localIdSeq = 0;
  private deleteRoles = $state<RoleWithId[]>([]);
  private updateRoles = $state<RoleWithId[]>([]);

  // biome-ignore lint/style/noNonNullAssertion: I'll initialize this later (TODO: it is possible to declare $state inside constructor in latest svelte)
  private savedRoles = $state<RoleWithId[]>()!;
  roles: RoleEditorEntry[] = $derived([
    ...this.savedRoles
      .filter((r) => !this.deleteRoles.some((dr) => dr.id === r.id))
      .map((r) => {
        const update = this.updateRoles.find((ur) => ur.id === r.id);
        return {
          ...r,
          ...update,
        };
      }),
    ...this.createRoles,
  ]);

  constructor(private initialRolesGetter: () => RoleWithId[]) {
    this.savedRoles = initialRolesGetter();
  }
  dirty = $state(false);
  valid = $derived(this.roles.every((r) => r.name.length > 0));

  refresh() {
    this.savedRoles = this.initialRolesGetter();
    this.reset();
  }
  reset() {
    this.createRoles = [];
    this.deleteRoles = [];
    this.updateRoles = [];
    this.dirty = false;
  }
  commit() {
    this.dirty = false;
    return {
      create: this.createRoles,
      update: this.updateRoles,
      delete: this.deleteRoles,
    };
  }

  editRole(
    role: RoleEditorEntry,
    to: {
      name?: string;
      max?: number;
      min?: number;
    },
  ) {
    this.dirty = true;
    if ("localId" in role) {
      const prev = this.createRoles.findIndex(
        (r) => r.localId === role.localId,
      );
      if (prev === -1) {
        this.createRoles.push({ ...role, ...to });
      } else {
        this.createRoles[prev] = { ...role, ...to };
      }
    } else {
      const prev = this.updateRoles.findIndex((r) => r.id === role.id);
      if (prev === -1) {
        this.updateRoles.push({ ...role, ...to });
      } else {
        this.updateRoles[prev] = { ...role, ...to };
      }
    }
  }
  delete(role: RoleEditorEntry) {
    this.dirty = true;
    if ("localId" in role) {
      const prev = this.createRoles.findIndex(
        (r) => r.localId === role.localId,
      );
      if (prev !== -1) {
        this.createRoles.splice(prev, 1);
      }
    } else {
      this.deleteRoles.push(role);
    }
  }
  addRole(name: string) {
    this.dirty = true;
    this.createRoles.push({
      localId: this._localIdSeq++,
      name,
      max: 1,
      min: 0,
    });
  }
}
