import { defineConfig } from "drizzle-kit";
import { process_env } from "../utils/env.ts";

export default defineConfig({
  verbose: true,
  schema: "./db/schema.ts",

  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process_env("CLOUDFLARE_ACCOUNT_ID"),
    databaseId: process_env("CLOUDFLARE_DATABASE_ID"),
    token: process_env("CLOUDFLARE_D1_TOKEN"),
  },
});
