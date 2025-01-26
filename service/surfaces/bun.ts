import { app } from "../src/app.ts";

Bun.serve({
  fetch: app.fetch,
});
