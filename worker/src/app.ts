import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Hono } from "hono";

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
