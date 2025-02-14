import { client } from "../api/client.ts";

const resp = await client.$post({
  json: {
    name: "aster-void and others",
  },
});
const _res = await resp.text();
