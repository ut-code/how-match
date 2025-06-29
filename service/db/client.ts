import { DefaultLogger } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { Context } from "hono";
import type { HonoOptions } from "service/types.ts";
import { env } from "../lib.ts";
import * as schema from "./schema.ts";

export const db = (c: Context<HonoOptions>): LibSQLDatabase<typeof schema> => {
  const DATABASE_URL = env(c, "DATABASE_URL");
  if (DATABASE_URL.startsWith("libsql:")) {
    // needs token (also disables logger)
    const DATABASE_TOKEN = env(c, "DATABASE_TURSO_TOKEN");
    return drizzle({
      schema,
      connection: {
        url: DATABASE_URL,
        authToken: DATABASE_TOKEN,
      },
    });
  }

  const logger = new DefaultLogger({
    writer: {
      write: (message) => console.log("[drizzle SQL]", message),
    },
  });
  return drizzle({
    schema,
    logger,
    connection: {
      url: DATABASE_URL,
    },
  });
};
