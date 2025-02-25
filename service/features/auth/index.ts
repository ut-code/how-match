import type { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { db } from "../../db/client.ts";
import { accounts, type SelectAccount } from "../../db/schema.ts";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import type { CookieOptions } from "hono/utils/cookie";
import { env } from "../../utils/env.ts";

function GET_COOKIE_SIGN(c: Context): string {
  return env(c, "COOKIE_SIGN");
}

const cookie_identifier__browser_id = "howmatch.browser_id";
// TODO: make it last forever or smth
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
};

type NoAuth = {
  name: string;
};

// TODO: implement authentication
type AuthInfo = {
  kind: "none";
  info: NoAuth;
};

export async function signup(c: Context, auth: AuthInfo): Promise<SelectAccount> {
  const browser_id = await getBrowserID(c);
  const prev = await _findAccount(c, auth);
  if (prev) {
    // already has an account
    return prev;
  }
  const account = (
    await db(c)
      .insert(accounts)
      .values({
        id: crypto.randomUUID(),
        browser_id,
        name: auth.info.name,
      })
      .returning()
  )[0];
  if (!account) throw new HTTPException(500, { message: "Failed to create account" });
  return account;
}

// TODO: implement authentication
export async function login(c: Context, auth: AuthInfo): Promise<SelectAccount> {
  const acc = await _findAccount(c, auth);
  if (acc) {
    setSignedCookie(c, cookie_identifier__browser_id, acc.browser_id, GET_COOKIE_SIGN(c), cookieOptions);
    return acc;
  }
  throw new HTTPException(404, { message: "account not found" });
}

// creates new one if necessary.
export async function getBrowserID(c: Context): Promise<string> {
  const cookie = await getSignedCookie(c, GET_COOKIE_SIGN(c), cookie_identifier__browser_id);
  if (cookie) {
    return cookie;
  }
  const browser_id = crypto.randomUUID();
  await setSignedCookie(c, cookie_identifier__browser_id, browser_id, GET_COOKIE_SIGN(c), cookieOptions);
  return browser_id;
}

// TODO: implement authentication
async function _findAccount(c: Context, auth: AuthInfo): Promise<SelectAccount | undefined> {
  switch (auth.kind) {
    case "none": {
      const accountsResult = await db(c)
        .select()
        .from(accounts)
        .where(eq(accounts.name, auth.info.name))
        .limit(1);
      return accountsResult[0]; // findUnique をしたかった
    }
    default:
      auth.kind satisfies never;
  }
}
