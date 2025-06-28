import { DefaultLogger } from "drizzle-orm";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import type { Context } from "hono";
import type { HonoOptions } from "service/types.ts";
import * as schema from "./schema.ts";
import { env } from "../lib.ts";

export const db = (c: Context<HonoOptions>): LibSQLDatabase<typeof schema> => {
  const DATABASE_URL = env(c, "DATABASE_URL");
  const DATABASE_TOKEN = env(c, "DATABASE_TURSO_TOKEN");

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
      authToken: DATABASE_TOKEN,
    },
  });
};
