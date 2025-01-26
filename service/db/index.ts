import { drizzle } from "drizzle-orm/libsql";
export const db = drizzle(process.env.DATABASE_URL ?? "./local.db");
