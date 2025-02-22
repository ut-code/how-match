import { array, minLength, minValue, nullable, number, object, pipe, string } from "valibot";

export const RoleSchema = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});
export const ProjectSchema = object({
  name: pipe(string(), minLength(1)),
  description: string(),
  roles: pipe(array(RoleSchema), minLength(1)),
});

export const PreferenceSchema = object({
  accountId: nullable(string()),
  participantName: string(),
  ratings: array(object({
    roleId: string(),
    score: number(),
  })),
});
