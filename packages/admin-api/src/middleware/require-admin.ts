import { userIsAppAdmin } from "@hesapport-api/auth";
import { HttpError } from "@hesapport-api/api/lib/http-error";
import type { NextFunction, Request, Response } from "express";

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) {
    next(new HttpError(401, "Admin session required"));
    return;
  }

  if (!userIsAppAdmin(req.session.user)) {
    next(new HttpError(403, "Admin role required"));
    return;
  }

  next();
}
