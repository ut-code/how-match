import { defineConfig } from "drizzle-kit";
import { process_env } from "./lib.ts";

export default defineConfig({
  schema: "./db/schema.ts",

  dbCredentials: {
    url: process_env("DATABASE_URL"),
    authToken: process_env("DATABASE_TOKEN"),
  },

  verbose: true,
  strict: true,
  dialect: "turso",
  out: "./.drizzle",
});
