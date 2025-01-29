import Bun from "bun";
const { app } = await import("~/app.ts");

Bun.serve({
  fetch: app.fetch,
});
