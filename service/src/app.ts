import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

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

export type App = typeof app;
