import type { HonoOptions } from "./types.ts";
import { Hono } from "hono";
import projects from "./routes/projects.ts";
import accounts from "./routes/sample.ts";
import { cors } from "hono/cors";

const app = new Hono<HonoOptions>()
  .basePath("/api")
  .use(
    "/*",
    async (c, next) => {
      return cors({ origin: c.env.CORS_ORIGIN || "http://localhost:5173" })(c, next);
    },
  )
  .get("/", (c) => c.text("Hello from Hono!"))
  .route("/projects", projects)
  .route("/accounts", accounts);

console.log("running");

export default app;
export type App = typeof app;
