import type { RequestEvent } from "@sveltejs/kit";
import app from "service/src";
import { panic } from "service/utils/panic";

async function hook(event: RequestEvent) {
  // @ts-ignore: TypeScript can't recognize platform type? FIXME: make it recognize App.env from src/app.d.ts
  return await app.fetch(event.request, (event.platform ?? panic("platform not found")).env);
}

export const GET = hook;
export const POST = hook;
export const PATCH = hook;
export const DELETE = hook;
