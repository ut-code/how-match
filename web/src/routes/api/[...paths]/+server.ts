import type { RequestEvent } from "@sveltejs/kit";
import app from "service";
import { panic } from "share/lib.ts";

async function hook(event: RequestEvent) {
  return await app.fetch(
    event.request,
    // @ts-ignore: TypeScript can't recognize platform type? FIXME: make it recognize App.env from src/app.d.ts
    (event.platform ?? panic("platform not found")).env,
  );
}

export const GET = hook;
export const POST = hook;
export const PUT = hook;
export const PATCH = hook;
export const DELETE = hook;
