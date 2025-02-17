import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const participant = sqliteTable("Participant", {
  id: text("id").notNull().primaryKey(),
  account_id: text("account_id").references(() => account.id).notNull(),
  project_id: text("project_id").references(() => project.id).notNull(),
  is_admin: integer("is_admin").notNull(),
});

export const account = sqliteTable("Account", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
});

export const project = sqliteTable("Project", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  closed_at: text(),
});

export const role = sqliteTable("Role", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  min: integer().notNull(),
  max: integer().notNull(),
  project_id: text("project_id").references(() => project.id).notNull(),
});

export const rating = sqliteTable("Rating", {
  id: text().notNull().primaryKey(),
  participant_id: text("participant_id").references(() => participant.id)
    .notNull(),
  role_id: text("role_id").references(() => role.id).notNull(),
  score: integer().notNull(),
  project_id: text("project_id").references(() => project.id).notNull(),
});

export const match = sqliteTable("Match", {
  id: text().notNull().primaryKey(),
  role_id: text("role_id").references(() => role.id).notNull(),
  participant_id: text("participant_id").references(() => participant.id)
    .notNull(),
  project_id: text("project_id").references(() => project.id).notNull(),
});

export type InsertParticipant = typeof participant.$inferInsert;
export type InsertAccount = typeof account.$inferInsert;
export type SelectAccount = typeof account.$inferSelect;
export type InsertProject = typeof project.$inferInsert;
export type InsertRole = typeof role.$inferInsert;
