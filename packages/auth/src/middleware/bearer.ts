import { verifyAccessToken } from "../lib/jwt";
import type { SessionPayload } from "../types";

export function extractBearerToken(authorization?: string): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token || null;
}

export async function resolveSession(authorization?: string): Promise<SessionPayload | null> {
  const token = extractBearerToken(authorization);
  if (!token) return null;
  return verifyAccessToken(token);
}
