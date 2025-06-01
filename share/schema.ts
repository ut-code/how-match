import {
  array,
  minLength,
  minValue,
  nullable,
  number,
  object,
  pipe,
  string,
  uuid,
  type InferInput,
  type InferOutput,
} from "valibot";

export const Role = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});
export type Role = InferOutput<typeof Role>;
export type RoleWithId = InferOutput<typeof RoleWithId>;
export type Project = InferOutput<typeof Project>;
export type ProjectInput = InferInput<typeof Project>;
export type Preference = InferOutput<typeof Preference>;

export const RoleWithId = object({
  id: pipe(string(), uuid()),
  ...Role.entries,
});
export const Project = object({
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
  roles: pipe(array(Role), minLength(1)),
  multipleRoles: number(),
  dropTooManyRoles: number(),
});

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
