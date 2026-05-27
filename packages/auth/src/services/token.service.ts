import { createHash, randomBytes } from "node:crypto";

import { db } from "@hesapport-api/db";
import { authToken, type AuthPrincipalType, type AuthTokenType } from "@hesapport-api/db/schema/auth-token";
import { env } from "@hesapport-api/env/server";
import { and, eq, gt } from "drizzle-orm";

import { newId } from "../lib/id";
import { AuthErrors } from "../lib/errors";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRawToken() {
  return randomBytes(32).toString("base64url");
}

export async function createAuthToken(input: {
  type: AuthTokenType;
  principalType: AuthPrincipalType;
  principalId: string;
}) {
  const raw = generateRawToken();
  const expiresAt = new Date(Date.now() + env.AUTH_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

  await db.insert(authToken).values({
    id: newId(),
    type: input.type,
    principalType: input.principalType,
    principalId: input.principalId,
    tokenHash: hashToken(raw),
    expiresAt,
  });

  return raw;
}

export async function consumeAuthToken(input: {
  raw: string;
  type: AuthTokenType;
  principalType: AuthPrincipalType;
}) {
  const tokenHash = hashToken(input.raw);
  const now = new Date();

  const [row] = await db
    .select()
    .from(authToken)
    .where(
      and(
        eq(authToken.tokenHash, tokenHash),
        eq(authToken.type, input.type),
        eq(authToken.principalType, input.principalType),
        gt(authToken.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) throw AuthErrors.invalidToken();

  await db.delete(authToken).where(eq(authToken.id, row.id));

  return row;
}
