import { zValidator } from "@hono/zod-validator";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { Hono } from "hono";
import { z } from "zod";

export function init(_db: LibSQLDatabase) {
  return new Hono().post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string(),
      }),
    ),
    (c) => {
      const name = c.req.valid("json").name;
      return c.text(`Hello ${name}!`);
    },
  );
}
