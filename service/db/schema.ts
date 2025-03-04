import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const participants = sqliteTable("participants", {
  id: text("id").notNull().primaryKey(),
  name: text().notNull(),
  browser_id: text("browser_id").notNull(),
  project_id: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  is_admin: integer("is_admin").notNull(),
  roles_count: integer("roles_count"),
});

export const accounts = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  browser_id: text().notNull().unique(),
  name: text().notNull(),
});

export const projects = sqliteTable("projects", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  closed_at: text(),
  multiple_roles: integer().notNull(),
});

export const roles = sqliteTable("roles", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  min: integer().notNull(),
  max: integer().notNull(),
  project_id: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const ratings = sqliteTable("ratings", {
  id: text().notNull().primaryKey(),
  participant_id: text("participant_id")
    .references(() => participants.id, { onDelete: "cascade" })
    .notNull(),
  role_id: text("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  score: integer().notNull(),
  project_id: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const matches = sqliteTable("matches", {
  id: text().notNull().primaryKey(),
  role_id: text("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  participant_id: text("participant_id")
    .references(() => participants.id, { onDelete: "cascade" })
    .notNull(),
  project_id: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
});

export type InsertParticipant = typeof participants.$inferInsert;
export type InsertAccount = typeof accounts.$inferInsert;
export type SelectAccount = typeof accounts.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type InsertRole = typeof roles.$inferInsert;
