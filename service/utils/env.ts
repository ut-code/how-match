import { panic } from "~utils/panic";

export function env(name: string): string {
  return process.env[name] ??
    panic(`env var "${name}" not found in process.env!`);
}
