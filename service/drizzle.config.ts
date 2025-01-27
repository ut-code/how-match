import { defineConfig } from "drizzle-kit";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// biome-ignore lint/style/noDefaultExport: it's used by drizzle-kit and I can't change the behaviour
export default defineConfig({
  schema: "./db/schema.ts",

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  verbose: true,
  strict: true,
  dialect: "sqlite",
  out: "./.drizzle",
});
