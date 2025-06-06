import { defineConfig } from "drizzle-kit";
import { process_env } from "./lib.ts";

export default defineConfig({
  schema: "./db/schema.ts",

  dbCredentials: {
    url: process_env("DATABASE_URL"),
  },

  verbose: true,
  strict: true,
  dialect: "sqlite",
  out: "./.migrations",
});
