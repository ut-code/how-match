import { app } from "..";

Bun.serve({
  fetch: app.fetch,
});
