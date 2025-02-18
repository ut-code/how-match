import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const participants = sqliteTable("participants", {
  id: text("id").notNull().primaryKey(),
  account_id: text("account_id").references(() => accounts.id).notNull(),
  project_id: text("project_id").references(() => projects.id).notNull(),
  is_admin: integer("is_admin").notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  browser_id: text(),
  name: text().notNull(),
});

export const projects = sqliteTable("projects", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  closed_at: text(),
});

export const roles = sqliteTable("roles", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  min: integer().notNull(),
  max: integer().notNull(),
  project_id: text("project_id").references(() => projects.id).notNull(),
});

export const ratings = sqliteTable("ratings", {
  id: text().notNull().primaryKey(),
  participant_id: text("participant_id").references(() => participants.id)
    .notNull(),
  role_id: text("role_id").references(() => roles.id).notNull(),
  score: integer().notNull(),
  project_id: text("project_id").references(() => projects.id).notNull(),
});

export const matches = sqliteTable("matches", {
  id: text().notNull().primaryKey(),
  role_id: text("role_id").references(() => roles.id).notNull(),
  participant_id: text("participant_id").references(() => participants.id)
    .notNull(),
  project_id: text("project_id").references(() => projects.id).notNull(),
});

export type InsertParticipant = typeof participants.$inferInsert;
export type InsertAccount = typeof accounts.$inferInsert;
export type SelectAccount = typeof accounts.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type InsertRole = typeof roles.$inferInsert;
