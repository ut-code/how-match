import { hc } from "hono/client";
import type { App } from "service/src";

export const client = hc<App>("http://localhost:3000");
