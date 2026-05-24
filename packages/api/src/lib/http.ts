import type { Response } from "express";

export function getSetCookieHeaders(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
}

export function forwardAuthCookies(authResponse: globalThis.Response, res: Response) {
  for (const cookie of getSetCookieHeaders(authResponse.headers)) {
    res.appendHeader("Set-Cookie", cookie);
  }
}

export function cookieHeaderFromSetCookies(setCookies: string[]): string {
  return setCookies.map((c) => c.split(";")[0]).join("; ");
}

export async function parseJsonResponse<T>(response: globalThis.Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}
