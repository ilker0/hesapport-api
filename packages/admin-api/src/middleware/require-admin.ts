import type { NextFunction, Request, Response } from "express";

import { HttpError } from "@hesapport-api/api/lib/http-error";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session || req.session.type !== "admin") {
    throw new HttpError(401, "Unauthorized");
  }
  next();
}
