import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono().get(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
    }),
  ),
  (c) => c.text("Hello World!"),
);

export type App = typeof app;
