import { auth } from "./index";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export async function signInEmailWithResponse(
  input: { email: string; password: string },
  req?: Request,
) {
  const email = input.email.trim().toLowerCase();

  return auth.api.signInEmail({
    body: {
      email,
      password: input.password,
    },
    headers: req ? fromNodeHeaders(req.headers) : undefined,
    asResponse: true,
  });
}

export function getAuthErrorMessage(payload: unknown): string {
  console.log('payload', payload);
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }
  return "Invalid email or password";
}
