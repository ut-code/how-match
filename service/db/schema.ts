import { integer, sqliteTable, } from "drizzle-orm/sqlite-core";

export const participant = sqliteTable("Participant", {
  participant_id: integer().primaryKey(),
  account_id: integer().notNull(),
  project_id: integer().notNull(),
  is_admin: integer().notNull(),
});

export type InsertParticipant = typeof participant.$inferInsert;
export type SelectParticipant = typeof participant.$inferSelect;
