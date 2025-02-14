import { drizzle } from "drizzle-orm/libsql";
import type { HonoOptions } from "src/types.ts";
import type { Context } from "hono";
import { env } from "../utils/env.ts";
import { panic } from "../utils/panic.ts";

let cache: ReturnType<typeof drizzle>;
export const db = (c: Context<HonoOptions>) => {
  if (cache) {
    return cache;
  }

  if (c.env.DB) {
    return c.env.DB;
  }

  switch (env(c, "DB_KIND")) {
    case "local": {
      cache = drizzle("file:../local.db");
      return cache;
    }
    case "memory": {
      cache = drizzle(":memory:");
      return cache;
    }
    default:
      panic(`unknown DB_KIND: got ${env(c, "DB_KIND")}`);
  }
};
