import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Participants = sqliteTable("participants", {
  id: text("id").notNull().primaryKey(),
  name: text().notNull(),
  browserId: text("browserId").notNull(),
  projectId: text("projectId")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
  isAdmin: integer("isAdmin").notNull(),
  rolesCount: integer("rolesCount").notNull(),
});

export const Accounts = sqliteTable("accounts", {
  id: text().notNull().primaryKey(),
  browserId: text("browserId").notNull().unique(),
  name: text().notNull(),
});

export const Projects = sqliteTable("projects", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  description: text(),
  closedAt: text("closedAt"),
  multipleRoles: integer().notNull(),
});

export const Roles = sqliteTable("roles", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  min: integer().notNull(),
  max: integer().notNull(),
  projectId: text("projectId")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const Ratings = sqliteTable("ratings", {
  id: text().notNull().primaryKey(),
  participantId: text("participantId")
    .references(() => Participants.id, { onDelete: "cascade" })
    .notNull(),
  roleId: text("roleId")
    .references(() => Roles.id, { onDelete: "cascade" })
    .notNull(),
  score: integer().notNull(),
  projectId: text("projectId")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export const Matches = sqliteTable("matches", {
  id: text().notNull().primaryKey(),
  roleId: text("roleId")
    .references(() => Roles.id, { onDelete: "cascade" })
    .notNull(),
  participantId: text("participantId")
    .references(() => Participants.id, { onDelete: "cascade" })
    .notNull(),
  projectId: text("projectId")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
});

export type InsertParticipant = typeof Participants.$inferInsert;
export type InsertAccount = typeof Accounts.$inferInsert;
export type SelectAccount = typeof Accounts.$inferSelect;
export type InsertProject = typeof Projects.$inferInsert;
export type InsertRole = typeof Roles.$inferInsert;
