import { process_env } from "./lib.ts";
import { defineConfig } from "drizzle-kit";

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
