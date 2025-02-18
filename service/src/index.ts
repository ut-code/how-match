import type { HonoOptions } from "./types.ts";
import { Hono } from "hono";
import projects from "./routes/projects.ts";
import accounts from "./routes/sample.ts";
import { cors } from "hono/cors";

const app = new Hono<HonoOptions>()
  .basePath("/api")
  .use("/*", cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }))
  .get("/", (c) => c.text("Hello from Hono!"))
  .route("/projects", projects)
  .route("/accounts", accounts);

console.log("running");

export default app;
export type App = typeof app;
