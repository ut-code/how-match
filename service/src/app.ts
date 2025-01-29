import { zValidator } from "@hono/zod-validator";
import { db } from "~db/client";
import { Hono } from "hono";
import { z } from "zod";
const _db = db;

export const app = new Hono().post(
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
