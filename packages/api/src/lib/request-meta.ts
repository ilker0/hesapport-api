import type { Request } from "express";

export function buildRequestMeta(req: Request) {
  return {
    ipAddress: req.ip || undefined,
    userAgent: req.get("user-agent") || undefined,
  };
}
