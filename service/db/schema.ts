import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Participants = sqliteTable("participants", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  browserId: text("browser_id").notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
  isAdmin: integer("is_admin").notNull(),
  rolesCount: integer("roles_count").notNull(),
});

export const Accounts = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  browserId: text("browser_id").notNull().unique(),
  name: text().notNull(),
});

export const Projects = sqliteTable("projects", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  closedAt: text("closed_at"),
  multipleRoles: integer("multiple_roles").notNull(),
  dropTooManyRoles: integer("drop_too_many_roles").notNull().default(0),
});

export const Roles = sqliteTable("roles", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  min: integer().notNull(),
  max: integer().notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const Ratings = sqliteTable("ratings", {
  id: text().notNull().primaryKey(),
  participantId: text("participant_id")
    .references(() => Participants.id, { onDelete: "cascade" })
    .notNull(),
  roleId: text("role_id")
    .references(() => Roles.id, { onDelete: "cascade" })
    .notNull(),
  score: integer().notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const Matches = sqliteTable("matches", {
  id: text().notNull().primaryKey(),
  roleId: text("role_id")
    .references(() => Roles.id, { onDelete: "cascade" })
    .notNull(),
  participantId: text("participant_id")
    .references(() => Participants.id, { onDelete: "cascade" })
    .notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export type InsertParticipant = typeof Participants.$inferInsert;
export type SelectParticipant = typeof Participants.$inferSelect;
export type InsertAccount = typeof Accounts.$inferInsert;
export type SelectAccount = typeof Accounts.$inferSelect;
export type InsertProject = typeof Projects.$inferInsert;
export type SelectProject = typeof Projects.$inferSelect;
export type InsertRole = typeof Roles.$inferInsert;
export type SelectRole = typeof Roles.$inferSelect;
export type InsertMatch = typeof Matches.$inferInsert;
export type SelectMatch = typeof Matches.$inferSelect;
