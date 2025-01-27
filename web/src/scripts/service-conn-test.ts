import { client } from "../api/client.ts";

const resp = await client.index.$post({
  json: {
    name: "aster-void and others",
  },
});
const _res = await resp.text();
