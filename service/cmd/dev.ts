import Bun from "bun";

import { app } from "../index.ts";

Bun.serve({
  fetch: app.fetch,
});
