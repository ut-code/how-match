import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const participant = sqliteTable("Participant", {
  id: integer("id").notNull().primaryKey(),
  account_id: integer("account_id").references(() => account.id).notNull(),
  project_id: integer("project_id").references(() => project.id).notNull(),
  is_admin: integer("is_admin").notNull(),
});

export const account = sqliteTable("Account", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
});

export const project = sqliteTable("Project", {
  id: integer().notNull().primaryKey(),
  name: text().notNull(),
});

export const role = sqliteTable("Role", {
  id: integer().notNull().primaryKey(),
  min: integer().notNull(),
  max: integer().notNull(),
  project_id: integer("project_id").references(() => project.id).notNull(),
});

export const rating = sqliteTable("Rating", {
  id: integer().notNull().primaryKey(),
  participant_id: integer("participant_id").references(() => participant.id).notNull(),
  role_id: integer("role_id").references(() => role.id).notNull(),
  score: integer().notNull(),
  project_id: integer("project_id").references(() => project.id).notNull(),
});

export const match = sqliteTable("Match", {
  id: integer().notNull().primaryKey(),
  role_id: integer("role_id").references(() => role.id).notNull(),
  participant_id: integer("participant_id").references(() => participant.id).notNull(),
  project_id: integer("project_id").references(() => project.id).notNull(),
});

export type InsertParticipant = typeof participant.$inferInsert;
export type InsertUser = typeof account.$inferInsert;
export type InsertProject = typeof project.$inferInsert;
export type InsertRole = typeof role.$inferInsert;
