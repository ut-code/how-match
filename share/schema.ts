import {
  array,
  minLength,
  minValue,
  number,
  object,
  pipe,
  string,
  uuid,
} from "valibot";

export const RoleSchema = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});
export const RoleWithIdSchema = object({
  id: pipe(string(), uuid()),
  ...RoleSchema.entries,
});
export const ProjectSchema = object({
  name: pipe(string(), minLength(1)),
  description: string(),
  roles: pipe(array(RoleSchema), minLength(1)),
  multipleRoles: number(),
});

export const PreferenceSchema = object({
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
