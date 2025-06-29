import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Participants = sqliteTable("participants", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  userId: text("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
  rolesCount: integer("roles_count").notNull(),
});

export const Admins = sqliteTable("admins", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  projectId: text("project_id")
    .references(() => Projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => Users.id, { onDelete: "cascade" })
    .notNull(),
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

// Better-auth tables
export const Users = sqliteTable("user", {
  id: text().notNull().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("account", {
  id: text().notNull().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text(),
  password: text(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text().notNull().primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text().notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
});

export const verification = sqliteTable("verification", {
  id: text().notNull().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

export const AdminsRelations = relations(Admins, ({ one }) => ({
  project: one(Projects, {
    fields: [Admins.projectId],
    references: [Projects.id],
  }),
}));
export const ParticipantsRelations = relations(Participants, ({ many }) => ({
  roles: many(Roles),
  ratings: many(Ratings),
  matches: many(Matches),
  admins: many(Admins),
}));
export const RolesRelations = relations(Roles, ({ many }) => ({
  participants: many(Participants),
  ratings: many(Ratings),
  matches: many(Matches),
  admins: many(Admins),
}));
export const ProjectsRelations = relations(Projects, ({ many }) => ({
  participants: many(Participants),
  roles: many(Roles),
  ratings: many(Ratings),
  matches: many(Matches),
  admins: many(Admins),
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
