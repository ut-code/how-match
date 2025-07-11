import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "service/lib.ts";
import projects from "service/routes/projects/index.ts";
import auth from "service/routes/auth.ts";
import type { HonoOptions } from "service/types.ts";

const app = new Hono<HonoOptions>()
  .basePath("/api")
  .use("/*", async (c, next) => {
    const CORS_ALLOW_ORIGINS = env(c, "CORS_ALLOW_ORIGINS", { fallback: "" });
    return await cors({
      origin: CORS_ALLOW_ORIGINS.split(","),
      credentials: true,
    })(c, next);
  })
  .get("/", (c) => c.text("Hello from Hono!"))
  .route("/auth", auth)
  .route("/projects", projects);

console.log("running");

export default app;
export type App = typeof app;
