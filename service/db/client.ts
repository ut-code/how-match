import { drizzle as libsql } from "drizzle-orm/libsql";
import { drizzle as d1, type DrizzleD1Database } from "drizzle-orm/d1";
import type { HonoOptions } from "../types.ts";
import type { Context } from "hono";
import { env } from "../utils/env.ts";
import { panic } from "../utils/panic.ts";

let cache: DrizzleD1Database;
export const db = (c: Context<HonoOptions>) => {
  if (cache) {
    return cache;
  }

  if (c.env?.DB) {
    return d1(c.env.DB);
  }

  switch (env(c, "DB_KIND")) {
    case "local": {
      cache = libsql("file:../local.db");
      return cache;
    }
    case "memory": {
      cache = libsql(":memory:");
      return cache;
    }
    default:
      panic(`unknown DB_KIND: got ${env(c, "DB_KIND")}`);
  }
};
