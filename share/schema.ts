import {
  type InferInput,
  type InferOutput,
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
} from "valibot";

export const CoerceBooleanToNumber = pipe(
  boolean(),
  transform((b: boolean) => (b ? 1 : 0)),
);
export const CoerceNumberToBoolean = pipe(
  number(),
  transform((b: number) => b === 1),
);

export const Role = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});

export type Role = InferOutput<typeof Role>;
export type RoleWithId = InferOutput<typeof RoleWithId>;
export type RoleWithIdAndPrev = InferOutput<typeof RoleWithIdAndPrev>;
export type InsertProjectOutput = InferOutput<typeof InsertProject>;
export type InsertProject = InferInput<typeof InsertProject>;
export type Preference = InferOutput<typeof Preference>;

export const RoleWithId = object({
  id: pipe(string(), uuid()),
  ...Role.entries,
});
export const RoleWithIdAndPrev = object({
  id: pipe(string(), uuid()),
  ...Role.entries,
  prev: nullable(number()),
});

export const InsertProject = object({
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
  roles: pipe(array(Role), minLength(1)),
  multipleRoles: boolean(),
  dropTooManyRoles: boolean(),
});
export const SelectProject = object({
  id: pipe(string(), uuid()),
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
  roles: pipe(array(RoleWithIdAndPrev), minLength(1)),
  multipleRoles: boolean(),
  dropTooManyRoles: boolean(),
  closedAt: nullable(string()),
});
export type SelectProject = InferOutput<typeof SelectProject>;

export const Preference = object({
  // browserId: string() -> validation の挟まるレイヤーでは存在しない、cookie からもってくるため
  participantName: string(),
  rolesCount: number(),
  ratings: array(
    object({
      roleId: string(),
      score: number(),
    }),
  ),
});
