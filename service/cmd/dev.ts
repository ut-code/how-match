import app from "../src/index.ts";

Bun.serve({
  fetch: app.fetch,
});
