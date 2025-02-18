import { array, nullable, number, object, string } from "valibot";

export const RoleSchema = object({
  name: string(),
  min: number(),
  max: number(),
});
export const ProjectSchema = object({
  name: string(),
  description: string(),
  role: array(RoleSchema),
});

export const PreferenceSchema = object({
  accountId: nullable(string()),
  participantName: string(),
  ratings: array(object({
    roleId: string(),
    score: number(),
  })),
});
