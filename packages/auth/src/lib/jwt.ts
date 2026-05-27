import { env } from "@hesapport-api/env/server";
import { SignJWT, jwtVerify } from "jose";

import type { SessionPayload } from "../types";

const encoder = new TextEncoder();
const secret = () => encoder.encode(env.JWT_SECRET);

function parseExpiresIn(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60;
  const n = Number(match[1]);
  const unit = match[2] ?? "d";
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (multipliers[unit] ?? 86400);
}

export async function signAccessToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${parseExpiresIn(env.JWT_EXPIRES_IN)}s`)
    .sign(secret());
}

export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const { sub, type, ...rest } = payload as SessionPayload & { sub: string };
    if (!sub || !type) return null;
    return { sub, type, ...rest } as SessionPayload;
  } catch {
    return null;
  }
}
