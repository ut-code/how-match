import { hc } from "hono/client";
import type { App } from "../../service/src/app";

export const client = hc<App>("http://localhost:3000");

const resp = await client.index.$post({
  json: {
    name: "aster-void and others",
  },
});
const res = await resp.text();
console.log(res);
