import { client } from "../api/client";

const resp = await client.index.$post({
  json: {
    name: "aster-void and others",
  },
});
const res = await resp.text();
console.log(res);
