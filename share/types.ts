import type { InferOutput } from "valibot";
import type { PreferenceSchema, ProjectSchema, RoleSchema } from "./schema.ts";

export type Role = InferOutput<typeof RoleSchema>;
export type Project = InferOutput<typeof ProjectSchema>;
export type Preference = InferOutput<typeof PreferenceSchema>;
