import type { RequestEvent } from "@sveltejs/kit";
import app from "service/src";

async function hook(event: RequestEvent) {
  // @ts-ignore: TypeScript can't recognize app.d.ts?
  return await app.fetch(event.request, event.platform.env);
}

export const GET = hook;
export const POST = hook;
export const PATCH = hook;
export const DELETE = hook;
