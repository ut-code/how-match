import { process_env } from "./utils/env.ts";
import { defineConfig } from "drizzle-kit";

// biome-ignore lint/style/noDefaultExport: it's used by drizzle-kit and I can't change the behaviour
export default defineConfig({
  schema: "./db/schema.ts",

  dbCredentials: {
    url: process_env("DATABASE_URL"),
  },

  verbose: true,
  strict: true,
  dialect: "sqlite",
  out: "./.drizzle",
});
