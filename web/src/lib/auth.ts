import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "",
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, getSession, useSession } = authClient;
