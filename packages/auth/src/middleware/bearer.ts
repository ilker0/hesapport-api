import { verifyAccessToken } from "../lib/jwt";
import { resolveActiveAuthSession, touchAuthSession } from "../services/session.service";
import type { SessionPayload } from "../types";

export function extractBearerToken(authorization?: string): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  return token || null;
}

export async function resolveSession(authorization?: string): Promise<SessionPayload | null> {
  const token = extractBearerToken(authorization);
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload?.sessionId) return null;

  const session = await resolveActiveAuthSession({
    sessionId: payload.sessionId,
    principalType: payload.type,
    principalId: payload.sub,
  });

  if (!session) return null;
  void touchAuthSession(session.id);
  return payload;
}
