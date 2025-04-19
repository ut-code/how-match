import { type DrizzleD1Database, drizzle as d1 } from "drizzle-orm/d1";
import { drizzle as libsql } from "drizzle-orm/libsql";
import type { Context } from "hono";
import type { HonoOptions } from "service/types.ts";

export const db = (c: Context<HonoOptions>): DrizzleD1Database => {
  if (c.env?.DB) {
    return d1(c.env.DB);
  }

  // if it's running on Cloudflare
  if (typeof process === "undefined") {
    throw new Error("ERROR: c.env.DB not found");
  }

  return libsql("file:../local.db") as unknown as DrizzleD1Database;
};
