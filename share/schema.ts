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
  partial,
  pipe,
  record,
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

export type Ratings = InferOutput<typeof Ratings>;
export const Ratings = record(pipe(string(), uuid()), number());
export type RatingsRepository = InferOutput<typeof RatingsRepository>;
export const RatingsRepository = array(
  object({
    roleId: pipe(string(), uuid()),
    score: number(),
  }),
);
export type SelectRatings = InferOutput<typeof SelectRatings>;
export const SelectRatings = pipe(
  RatingsRepository,
  transform(
    (r) =>
      <Ratings>(
        Object.fromEntries(r.map(({ roleId, score }) => [roleId, score]))
      ),
  ),
);
export const InsertRatings = pipe(
  Ratings,
  transform(
    (r) =>
      <RatingsRepository>(
        Object.entries(r).map(([roleId, score]) => ({ roleId, score }))
      ),
  ),
);

export type SelectPreference = InferOutput<typeof SelectPreference>;
export const SelectPreference = object({
  participantName: string(),
  rolesCount: number(),
});
export type InsertPreference = InferInput<typeof InsertPreference>;
export const InsertPreference = object({
  participantName: string(),
  rolesCount: number(),
});

export type InsertRole = InferOutput<typeof InsertRole>;
export const InsertRole = object({
  name: pipe(string(), minLength(1)),
  min: pipe(number(), minValue(0)),
  max: pipe(number(), minValue(1)),
});
export type SelectRole = InferOutput<typeof SelectRole>;
export const SelectRole = object({
  id: pipe(string(), uuid()),
  ...InsertRole.entries,
});

export type InsertProject = InferInput<typeof InsertProject>;
export type InsertProjectOutput = InferOutput<typeof InsertProject>;
export const InsertProject = object({
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
  roles: pipe(array(InsertRole), minLength(1)),
  multipleRoles: CoerceBooleanToNumber,
  dropTooManyRoles: CoerceBooleanToNumber,
});
export type InsertProjectPartial = InferOutput<typeof InsertProjectPartial>;
export const InsertProjectPartial = partial(InsertProject);
export type SelectProjectInput = InferInput<typeof SelectProject>;
export type SelectProject = InferOutput<typeof SelectProject>;
export const SelectProject = object({
  id: pipe(string(), uuid()),
  name: pipe(string(), minLength(1)),
  description: nullable(string()),
  multipleRoles: CoerceNumberToBoolean,
  dropTooManyRoles: CoerceNumberToBoolean,
  closedAt: nullable(string()),
});
