import type { InferOutput } from "valibot";
import type {
  PreferenceSchema,
  ProjectSchema,
  RoleSchema,
  RoleWithIdSchema,
} from "./schema.ts";

export type Role = InferOutput<typeof RoleSchema>;
export type RoleWithId = InferOutput<typeof RoleWithIdSchema>;
export type Project = InferOutput<typeof ProjectSchema>;
export type Preference = InferOutput<typeof PreferenceSchema>;
