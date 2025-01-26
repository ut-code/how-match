// is there really no other way to do this?
import { init as _init } from "./src/app.ts";

export const init = _init;
export type App = ReturnType<typeof _init>;
