import { auth } from "@hesapport-api/auth";
import { getUserPermissions, getUserRoleNames, userHasRole } from "@hesapport-api/auth";
import { env } from "@hesapport-api/env/server";
import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { z } from "zod";

import { cookieHeaderFromSetCookies, forwardAuthCookies, getSetCookieHeaders, parseJsonResponse } from "../lib/http";
import { getSession } from "../lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const adminAuthRouter = Router();

/** Admin-only login (Better Auth sign-in + admin role check) */
adminAuthRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const signInResponse = await auth.handler(
    new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    }),
  );

  const setCookies = getSetCookieHeaders(signInResponse.headers);

  if (!signInResponse.ok) {
    const error = await parseJsonResponse(signInResponse);
    res.status(signInResponse.status).json(error);
    return;
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      cookie: cookieHeaderFromSetCookies(setCookies),
    }),
  });

  if (!session) {
    res.status(500).json({ error: "Session could not be established" });
    return;
  }

  const isAdmin = await userHasRole(session.user.id, "admin");

  if (!isAdmin) {
    await auth.handler(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: { cookie: cookieHeaderFromSetCookies(setCookies) },
      }),
    );
    res.status(403).json({
      error: "Forbidden",
      message: "Only users with the admin role can sign in here",
    });
    return;
  }

  forwardAuthCookies(signInResponse, res);

  const [roles, permissions] = await Promise.all([
    getUserRoleNames(session.user.id),
    getUserPermissions(session.user.id),
  ]);

  res.json({
    user: session.user,
    session: session.session,
    roles,
    permissions,
  });
});

adminAuthRouter.post("/logout", async (req, res) => {
  const response = await auth.handler(
    new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-out`, {
      method: "POST",
      headers: fromNodeHeaders(req.headers),
    }),
  );

  forwardAuthCookies(response, res);
  res.status(response.status).json(await parseJsonResponse(response));
});

adminAuthRouter.get("/session", async (req, res) => {
  const session = await getSession(req);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const isAdmin = await userHasRole(session.user.id, "admin");

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden", message: "Admin role required" });
    return;
  }

  const [roles, permissions] = await Promise.all([
    getUserRoleNames(session.user.id),
    getUserPermissions(session.user.id),
  ]);

  res.json({
    user: session.user,
    session: session.session,
    roles,
    permissions,
  });
});
