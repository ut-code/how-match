import { DefaultLogger } from "drizzle-orm";
import { type DrizzleD1Database, drizzle as d1 } from "drizzle-orm/d1";
import { drizzle as libsql } from "drizzle-orm/libsql";
import type { Context } from "hono";
import type { HonoOptions } from "service/types.ts";
import * as schema from "./schema.ts";

export const db = (
  c: Context<HonoOptions>,
): DrizzleD1Database<typeof schema> => {
  if (c.env?.DB) {
    return d1(c.env.DB, {
      schema,
    });
  }

  // if it's running on Cloudflare
  if (typeof process === "undefined") {
    throw new Error("ERROR: c.env.DB not found");
  }

  const logger = new DefaultLogger({
    writer: {
      write: (message) => console.log("[drizzle SQL]", message),
    },
  });
  return libsql({
    schema,
    logger,
    connection: {
      url: "file:../local.db",
    },
  }) as unknown as DrizzleD1Database<typeof schema>;
};
