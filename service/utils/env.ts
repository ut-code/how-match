import type { Context } from "hono";
import { env as _env } from "hono/adapter";
import { panic } from "./panic.ts";

export function env(ctx: Context, name: string, options: { fallback?: string } = {}) {
  return _env(ctx)?.[name] ?? options.fallback ??
    panic(`env var "${name}" not found in environment!`);
}

export function process_env(name: string) {
  return process.env[name] ??
    panic(`env var "${name}" not found in environment!`);
}
