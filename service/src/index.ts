import type { HonoOptions } from "./types.ts";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "../utils/env.ts";
import { projects } from "./routes/projects.ts";
import { accounts } from "./routes/sample.ts";

const corsOptions = (c: Context) => ({
  origin: env(c, "CORS_ALLOW_ORIGINS").split(","),
});

const app = new Hono<HonoOptions>()
  .basePath("/api")
  .use(async (c, next) => {
    await cors(corsOptions(c))(
      c,
      next,
    );
  })
  .get("/", (c) => c.text("Hello from Hono!"))
  .route("/projects", projects)
  .route("/accounts", accounts);

console.log("running");

// biome-ignore lint/style/noDefaultExport:
export default app;
export type App = typeof app;
