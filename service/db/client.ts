import { drizzle as libsql } from "drizzle-orm/libsql";
import { drizzle as d1, type DrizzleD1Database } from "drizzle-orm/d1";
import type { HonoOptions } from "service/types.ts";
import type { Context } from "hono";

export const db = (c: Context<HonoOptions>) => {
  if (c.env?.DB) {
    return d1(c.env.DB);
  }

  // if it's running on Cloudflare
  if (typeof process === "undefined") {
    throw new Error("ERROR: c.env.DB not found");
  }

  const db: DrizzleD1Database = libsql("file:../local.db");
  return db;
};
