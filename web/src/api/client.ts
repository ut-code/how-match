import { browser } from "$app/environment";
import { hc } from "hono/client";
import type { App } from "service/index.ts";

// during development, use isolated server for better hot reload
const baseUrl = import.meta.env.DEV ? "http://localhost:3000/" : "/";
console.log(`[log] hono/client: baseUrl = ${baseUrl}`);

export type Client = ReturnType<typeof hc<App>>["api"];
export type Fetch = typeof fetch;
export function createClient({ fetch }: { fetch: Fetch }): Client {
  return hc<App>(baseUrl, {
    fetch,
    init: {
      credentials: browser ? "include" : undefined,
    },
  }).api;
}
