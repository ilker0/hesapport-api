import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/http-error";
import type { SessionPayload } from "@hesapport-api/auth";

function requireType(req: Request, type: SessionPayload["type"]) {
  if (!req.session || req.session.type !== type) {
    throw new HttpError(401, "Unauthorized");
  }
  return req.session;
}

export function requireOwner(req: Request, _res: Response, next: NextFunction) {
  requireType(req, "owner");
  next();
}

export function requireOrgUser(req: Request, _res: Response, next: NextFunction) {
  requireType(req, "org_user");
  next();
}

export function requireOwnerOrOrgUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.session || (req.session.type !== "owner" && req.session.type !== "org_user")) {
    throw new HttpError(401, "Unauthorized");
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session) {
    throw new HttpError(401, "Unauthorized");
  }
  next();
}
