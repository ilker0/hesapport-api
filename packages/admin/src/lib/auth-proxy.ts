import { auth } from "@hesapport-api/auth";
import { env } from "@hesapport-api/env/server";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { parseJsonResponse } from "./http";

const AUTH_BASE = `${env.BETTER_AUTH_URL}/api/auth`;

export async function proxyAuthRequest(
  req: Request,
  path: string,
  init?: { method?: string; body?: unknown },
) {
  const headers = new Headers(fromNodeHeaders(req.headers));

  if (init?.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  return auth.handler(
    new Request(`${AUTH_BASE}${path}`, {
      method: init?.method ?? req.method,
      headers,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    }),
  );
}

export async function proxyAuthJson<T>(req: Request, path: string, init?: { method?: string; body?: unknown }) {
  const response = await proxyAuthRequest(req, path, init);
  const data = await parseJsonResponse<T>(response);
  return { response, data };
}
