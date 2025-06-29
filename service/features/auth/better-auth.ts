import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db/client.ts";
import { accounts, session, Users, verification } from "../../db/schema.ts";
import type { Context } from "hono";
import { env } from "../../lib.ts";

export function createAuth(c: Context) {
  return betterAuth({
    database: drizzleAdapter(db(c), {
      provider: "sqlite",
      schema: {
        user: Users,
        account: accounts,
        session,
        verification,
      },
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    socialProviders: {
      google: {
        clientId: env(c, "OAUTH_GOOGLE_CLIENT_ID"),
        clientSecret: env(c, "OAUTH_GOOGLE_SECRET_ID"),
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
