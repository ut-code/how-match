import type { D1Database } from "@cloudflare/workers-types";
// This ensures c.env.DB is correctly typed
export type Bindings = {
  DB: D1Database;
  CORS_ORIGIN: string;
};

export type HonoOptions = {
  Bindings: Bindings;
};
