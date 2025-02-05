import { drizzle } from "drizzle-orm/libsql";
import { env } from "../utils/env.ts";
import { panic } from "../utils/panic.ts";
import type { Context } from "hono";

let cache: ReturnType<typeof drizzle>;
export const db = (ctx: Context) => {
  if (cache) {
    return cache;
  }

  switch (env(ctx, "DB_KIND")) {
    case "local": {
      cache = drizzle("file:./local.db");
      return cache;
    }
    case "memory": {
      cache = drizzle(":memory:");
      return cache;
    }
    default:
      panic(`unknown DB_KIND: got ${env(ctx, "DB_KIND")}`);
  }
};
