import { defineConfig } from "drizzle-kit";

export default defineConfig({
  verbose: true,
  schema: "../db/schema.ts",

  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: "",
    databaseId: "",
    token: "",
  },
});
