import { relations } from "drizzle-orm";
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

export const ParticipantsRelations = relations(Participants, ({ many }) => ({
  roles: many(Roles),
  ratings: many(Ratings),
  matches: many(Matches),
}));
export const RolesRelations = relations(Roles, ({ many }) => ({
  participants: many(Participants),
  ratings: many(Ratings),
  matches: many(Matches),
}));
export const ProjectsRelations = relations(Projects, ({ many }) => ({
  participants: many(Participants),
  roles: many(Roles),
  ratings: many(Ratings),
  matches: many(Matches),
}));
export const RatingsRelations = relations(Ratings, ({ one }) => ({
  participant: one(Participants, {
    fields: [Ratings.participantId],
    references: [Participants.id],
  }),
  role: one(Roles, {
    fields: [Ratings.roleId],
    references: [Roles.id],
  }),
}));
export const MatchesRelations = relations(Matches, ({ one }) => ({
  participant: one(Participants, {
    fields: [Matches.participantId],
    references: [Participants.id],
  }),
  role: one(Roles, {
    fields: [Matches.roleId],
    references: [Roles.id],
  }),
}));
