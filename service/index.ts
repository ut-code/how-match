import type { HonoOptions } from "./types.ts";
import { Hono } from "hono";
import projects from "./routes/projects.ts";
import { cors } from "hono/cors";
import { env } from "./utils/env.ts";

const app = new Hono<HonoOptions>()
  .basePath("/api")
  .use("/*", cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }))
  .use(
    "/*",
    async (c, next) => {
      const CORS_ALLOW_ORIGINS = env(c, "CORS_ALLOW_ORIGINS", "");
      return await cors({
        origin: CORS_ALLOW_ORIGINS.split(","),
        credentials: true,
      })(c, next);
    },
  )
  .get("/", (c) => c.text("Hello from Hono!"))
  .route("/projects", projects);

console.log("running");

export default app;
export type App = typeof app;
