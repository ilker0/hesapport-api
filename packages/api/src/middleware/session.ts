import { auth } from "@hesapport-api/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";

export type AppSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  req.session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  next();
}

declare module "express-serve-static-core" {
  interface Request {
    session?: AppSession | null;
  }
}
