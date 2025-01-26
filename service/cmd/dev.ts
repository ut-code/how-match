import { init } from "..";
import { db } from "../db/local.ts";

const app = init(db);

Bun.serve({
  fetch: app.fetch,
});
