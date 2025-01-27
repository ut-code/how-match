import Bun from "bun";

import { db } from "../db/local.ts";
import { init } from "../index.ts";

const app = init(db);

Bun.serve({
  fetch: app.fetch,
});
