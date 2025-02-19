import { hc } from "hono/client";
import type { App } from "service/src";

// during development, use isolated server for better hot reload
const baseUrl = import.meta.env.DEV ? "http://localhost:3000/" : "/";
console.log(`[log] hono/client: baseUrl = ${baseUrl}`);

export const client = hc<App>(baseUrl, {
  init: {
    credentials: "include",
  },
}).api;
