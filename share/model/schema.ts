import {
  array,
  boolean,
  minLength,
  minValue,
  nullable,
  number,
  object,
  pipe,
  string,
  transform,
  uuid,
  type InferInput,
  type InferOutput,
} from "valibot";

export const CoerceBooleanToNumber = pipe(
  boolean(),
  transform((b: boolean) => (b ? 1 : 0)),
);
export const CoerceNumberToBoolean = pipe(
  number(),
  transform((b: number) => b === 1),
);

export type Role = InferOutput<typeof Role>;
export type RoleWithId = InferOutput<typeof RoleWithId>;
export type RoleWithIdAndPrev = InferOutput<typeof RoleWithIdAndPrev>;
export const Role = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});
export const RoleWithId = object({
  id: pipe(string(), uuid()),
  ...Role.entries,
});
export const RoleWithIdAndPrev = object({
  id: pipe(string(), uuid()),
  ...Role.entries,
  prev: nullable(number()),
});

export type InsertProject = InferInput<typeof InsertProject>;
export type SelectProject = InferOutput<typeof SelectProject>;
const _CommonProject = object({
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
});
export const InsertProject = object({
  ..._CommonProject.entries,
  roles: pipe(array(Role), minLength(1)),
  multipleRoles: pipe(boolean(), CoerceBooleanToNumber),
  dropTooManyRoles: pipe(boolean(), CoerceBooleanToNumber),
});
export const SelectProject = object({
  id: pipe(string(), uuid()),
  ..._CommonProject.entries,
  roles: pipe(array(RoleWithIdAndPrev), minLength(1)),
  multipleRoles: CoerceNumberToBoolean,
  dropTooManyRoles: CoerceNumberToBoolean,
  closedAt: nullable(string()),
});

export type InsertPreference = InferInput<typeof InsertPreference>;
export type SelectPreference = InferOutput<typeof SelectPreference>;
export const InsertPreference = object({
  participantName: string(),
  rolesCount: number(),
  ratings: array(
    object({
      roleId: string(),
      score: number(),
    }),
  ),
});
export const SelectPreference = object({
  ...InsertPreference.entries,
  id: pipe(string(), uuid()),
});
