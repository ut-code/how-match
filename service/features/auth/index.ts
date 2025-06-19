import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import type { CookieOptions } from "hono/utils/cookie";
import { db } from "service/db/client.ts";
import { Accounts, type SelectAccount } from "service/db/schema.ts";
import { env } from "service/lib.ts";

function GET_COOKIE_SIGN(c: Context): string {
  return env(c, "COOKIE_SIGN");
}

const cookie_identifier__browserId = "howmatch.browserId";
// TODO: make it last forever or smth
const cookieSecond = 1;
const cookieMonth = 30 * 24 * 60 * 60 * cookieSecond;
const maxAge = 1 * 12 * cookieMonth; // cannot be longer than 400 days
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge,
};

type NoAuth = {
  name: string;
};

// TODO: implement authentication
type AuthInfo = {
  kind: "none";
  info: NoAuth;
};

export async function signup(
  c: Context,
  auth: AuthInfo,
): Promise<SelectAccount> {
  const browserId = await getBrowserID(c);
  const prev = await _findAccount(c, auth);
  if (prev) {
    // already has an account
    return prev;
  }
  const account = (
    await db(c)
      .insert(Accounts)
      .values({
        id: crypto.randomUUID(),
        browserId,
        name: auth.info.name,
      })
      .returning()
  )[0];
  if (!account)
    throw new HTTPException(500, { message: "Failed to create account" });
  return account;
}

// TODO: implement authentication
export async function login(
  c: Context,
  auth: AuthInfo,
): Promise<SelectAccount> {
  const acc = await _findAccount(c, auth);
  if (acc) {
    setSignedCookie(
      c,
      cookie_identifier__browserId,
      acc.browserId,
      GET_COOKIE_SIGN(c),
      cookieOptions,
    );
    return acc;
  }
  throw new HTTPException(404, { message: "account not found" });
}

// creates new one if necessary.
export async function getBrowserID(c: Context): Promise<string> {
  const cookie = await getSignedCookie(
    c,
    GET_COOKIE_SIGN(c),
    cookie_identifier__browserId,
  );
  if (cookie) {
    await setSignedCookie(
      c,
      cookie_identifier__browserId,
      cookie,
      GET_COOKIE_SIGN(c),
      cookieOptions,
    );
    return cookie;
  }
  const browserId = crypto.randomUUID();
  await setSignedCookie(
    c,
    cookie_identifier__browserId,
    browserId,
    GET_COOKIE_SIGN(c),
    cookieOptions,
  );
  return browserId;
}

// TODO: implement authentication
async function _findAccount(
  c: Context,
  auth: AuthInfo,
): Promise<SelectAccount | undefined> {
  switch (auth.kind) {
    case "none": {
      const accountsResult = await db(c)
        .select()
        .from(Accounts)
        .where(eq(Accounts.name, auth.info.name))
        .limit(1);
      return accountsResult[0]; // findUnique をしたかった
    }
    default:
      auth.kind satisfies never;
  }
}
