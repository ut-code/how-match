import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { hc } from "hono/client";
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
export const client = hc<App>("http://localhost:3000");
