import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export function sessionHeaders(req: Request) {
  return fromNodeHeaders(req.headers);
}

export function queryFromRequest(query: Request["query"]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}
