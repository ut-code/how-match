import type { Context } from "hono";
import { env as _env } from "hono/adapter";
import { panic } from "./panic.ts";

export function env(ctx: Context, name: string) {
  return _env(ctx)[name] ??
    panic(`env var "${name}" not found in environment!`);
}
