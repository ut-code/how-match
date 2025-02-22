import { drizzle as libsql } from "drizzle-orm/libsql";
import { drizzle as d1, type DrizzleD1Database } from "drizzle-orm/d1";
import type { HonoOptions } from "../types.ts";
import type { Context } from "hono";

let cache: DrizzleD1Database;
export const db = (c: Context<HonoOptions>) => {
  if (cache) {
    return cache;
  }

  if (c.env?.DB) {
    return d1(c.env.DB);
  }

  // if it's running on Cloudflare
  if (typeof process === "undefined") {
    throw new Error("ERROR: c.env.DB not found");
  }

  cache = libsql("file:../local.db");
  return cache;
};
