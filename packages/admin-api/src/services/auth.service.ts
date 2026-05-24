import { auth, getAuthErrorMessage, signInEmailWithResponse, userIsAppAdmin } from "@hesapport-api/auth";
import {
  cookieHeaderFromSetCookies,
  getSetCookieHeaders,
  parseJsonResponse,
} from "@hesapport-api/api/lib/http";
import { HttpError } from "@hesapport-api/api/lib/http-error";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import type { z } from "zod";

import type { adminLoginSchema } from "../schemas/auth.schema";

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export type AdminSessionPayload = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"];
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"];
};

export async function adminLogin(
  input: AdminLoginInput,
  req: Request,
): Promise<{ payload: AdminSessionPayload; signInResponse: globalThis.Response }> {
  const signInResponse = await signInEmailWithResponse(input, req);
  const setCookies = getSetCookieHeaders(signInResponse.headers);

  if (!signInResponse.ok) {
    const error = await parseJsonResponse(signInResponse);
    throw new HttpError(401, getAuthErrorMessage(error), error);
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: cookieHeaderFromSetCookies(setCookies),
    }),
  });

  if (!session) {
    throw new HttpError(500, "Session could not be established");
  }

  if (!userIsAppAdmin(session.user)) {
    await auth.api.signOut({
      headers: new Headers({ cookie: cookieHeaderFromSetCookies(setCookies) }),
    });
    throw new HttpError(403, "Only users with the admin role can sign in here");
  }

  return {
    signInResponse,
    payload: {
      user: session.user,
      session: session.session,
    },
  };
}

export async function adminLogout(req: Request) {
  return auth.api.signOut({
    headers: fromNodeHeaders(req.headers),
    asResponse: true,
  });
}

export async function getAdminSessionForUser(
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
): Promise<AdminSessionPayload> {
  return {
    user: session.user,
    session: session.session,
  };
}
