import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createAuth } from "./better-auth.ts";

export async function getCurrentUser(c: Context) {
  const auth = createAuth(c);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  return session?.user;
}

export async function getCurrentUserId(
  c: Context,
): Promise<string | undefined> {
  const user = await getCurrentUser(c);
  return user?.id;
}

export async function requireAuth(c: Context): Promise<string> {
  const userId = await getCurrentUserId(c);
  if (!userId) {
    throw new HTTPException(401, { message: "Authentication required" });
  }
  return userId;
}

export { createAuth };
