import type { RequestEvent } from "@sveltejs/kit";
import app from "service/src";

export const GET = async (event: RequestEvent) => app.fetch(event.request);
export const POST = async (event: RequestEvent) => app.fetch(event.request);
export const PATCH = async (event: RequestEvent) => app.fetch(event.request);
export const DELETE = async (event: RequestEvent) => app.fetch(event.request);
