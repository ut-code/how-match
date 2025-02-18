import { vValidator } from "@hono/valibot-validator";
import { type BaseIssue, type BaseSchema, object, type ObjectEntries } from "valibot";

export function param<T extends ObjectEntries>(values: T) {
  return vValidator("param", object(values));
}

export function query<T extends ObjectEntries>(values: T) {
  return vValidator("param", object(values));
}

export function json<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: T) {
  return vValidator("json", schema);
}
