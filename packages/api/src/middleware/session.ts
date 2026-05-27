import { resolveSession } from "@hesapport-api/auth";
import type { NextFunction, Request, Response } from "express";

import type { SessionPayload } from "@hesapport-api/auth";

export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  req.session = (await resolveSession(typeof authorization === "string" ? authorization : undefined)) ?? undefined;
  next();
}

declare module "express-serve-static-core" {
  interface Request {
    session?: SessionPayload;
  }
}
