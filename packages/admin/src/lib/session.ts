import { auth } from "@hesapport-api/auth";
import { userHasRole } from "@hesapport-api/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function getSession(req: Request): Promise<AdminSession | null> {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = await getSession(req);

  if (!session) {
    res.status(401).json({ error: "Unauthorized", message: "Admin session required" });
    return;
  }

  const isAdmin = await userHasRole(session.user.id, "admin");

  if (!isAdmin) {
    res.status(403).json({ error: "Forbidden", message: "Admin role required" });
    return;
  }

  req.adminSession = session;
  next();
}

export {};

declare module "express-serve-static-core" {
  interface Request {
    adminSession?: AdminSession;
  }
}
