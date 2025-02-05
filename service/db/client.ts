import { drizzle } from "drizzle-orm/libsql";
import { env } from "../utils/env.ts";
import { panic } from "../utils/panic.ts";

export const db = (() => {
  switch (env("DB_KIND")) {
    case "local":
      return drizzle("file:./local.db");
    case "memory":
      return drizzle(":memory:");
    case "turso":
      return drizzle({
        connection: {
          url: env("TURSO_CONNECTION_URL"),
          authToken: env("TURSO_AUTH_TOKEN"),
        },
      });
    default:
      panic(`unknown DB_KIND: got ${env("DB_KIND")}`);
  }
})();
