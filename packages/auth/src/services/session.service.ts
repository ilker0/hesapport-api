import { db } from "@hesapport-api/db";
import { authSession } from "@hesapport-api/db/schema/auth-session";
import { adminUser } from "@hesapport-api/db/schema/admin";
import { owner } from "@hesapport-api/db/schema/owner";
import { orgUser, organization } from "@hesapport-api/db/schema/organization";
import { and, eq, gt, isNull } from "drizzle-orm";

import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import type { PrincipalType } from "../types";

function parseExpiresIn(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60;
  const n = Number(match[1]);
  const unit = match[2] ?? "d";
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (multipliers[unit] ?? 86400);
}

export function buildSessionExpiresAt(jwtExpiresIn: string) {
  return new Date(Date.now() + parseExpiresIn(jwtExpiresIn) * 1000);
}

export async function createAuthSession(input: {
  principalType: PrincipalType;
  principalId: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}) {
  const [row] = await db
    .insert(authSession)
    .values({
      id: newId(),
      principalType: input.principalType,
      principalId: input.principalId,
      organizationId: input.organizationId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: input.expiresAt,
      revokedAt: null,
      lastSeenAt: new Date(),
    })
    .returning();

  if (!row) throw new Error("Failed to create auth session");
  return row;
}

export async function resolveActiveAuthSession(input: {
  sessionId: string;
  principalType: PrincipalType;
  principalId: string;
}) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(authSession)
    .where(
      and(
        eq(authSession.id, input.sessionId),
        eq(authSession.principalType, input.principalType),
        eq(authSession.principalId, input.principalId),
        isNull(authSession.revokedAt),
        gt(authSession.expiresAt, now),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function touchAuthSession(sessionId: string) {
  await db.update(authSession).set({ lastSeenAt: new Date() }).where(eq(authSession.id, sessionId));
}

export async function revokeAuthSessionById(sessionId: string) {
  const [row] = await db
    .update(authSession)
    .set({ revokedAt: new Date() })
    .where(eq(authSession.id, sessionId))
    .returning();
  if (!row) throw AuthErrors.notFound("Session");
  return row;
}

export async function listOwnerOrgUserSessions(ownerId: string) {
  const now = new Date();
  return db
    .select({
      session: authSession,
      orgUser: {
        id: orgUser.id,
        email: orgUser.email,
        username: orgUser.username,
        displayName: orgUser.displayName,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    })
    .from(authSession)
    .innerJoin(orgUser, eq(orgUser.id, authSession.principalId))
    .innerJoin(organization, eq(organization.id, orgUser.organizationId))
    .where(
      and(
        eq(organization.ownerId, ownerId),
        eq(authSession.principalType, "org_user"),
        isNull(authSession.revokedAt),
        gt(authSession.expiresAt, now),
      ),
    );
}

export async function revokeOwnerOrgUserSession(ownerId: string, sessionId: string) {
  const [row] = await db
    .select({
      id: authSession.id,
      ownerId: organization.ownerId,
      principalType: authSession.principalType,
    })
    .from(authSession)
    .innerJoin(orgUser, eq(orgUser.id, authSession.principalId))
    .innerJoin(organization, eq(organization.id, orgUser.organizationId))
    .where(eq(authSession.id, sessionId))
    .limit(1);

  if (!row) throw AuthErrors.notFound("Session");
  if (row.ownerId !== ownerId || row.principalType !== "org_user") throw AuthErrors.forbidden();
  return revokeAuthSessionById(sessionId);
}

export async function listAdminSessions() {
  const now = new Date();

  const [adminSessions, ownerSessions, orgUserSessions] = await Promise.all([
    db
      .select({
        session: authSession,
        admin: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
      })
      .from(authSession)
      .innerJoin(adminUser, eq(adminUser.id, authSession.principalId))
      .where(
        and(
          eq(authSession.principalType, "admin"),
          isNull(authSession.revokedAt),
          gt(authSession.expiresAt, now),
        ),
      ),
    db
      .select({
        session: authSession,
        owner: { id: owner.id, email: owner.email, name: owner.name },
      })
      .from(authSession)
      .innerJoin(owner, eq(owner.id, authSession.principalId))
      .where(
        and(
          eq(authSession.principalType, "owner"),
          isNull(authSession.revokedAt),
          gt(authSession.expiresAt, now),
        ),
      ),
    db
      .select({
        session: authSession,
        orgUser: {
          id: orgUser.id,
          email: orgUser.email,
          username: orgUser.username,
          displayName: orgUser.displayName,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          ownerId: organization.ownerId,
        },
      })
      .from(authSession)
      .innerJoin(orgUser, eq(orgUser.id, authSession.principalId))
      .innerJoin(organization, eq(organization.id, orgUser.organizationId))
      .where(
        and(
          eq(authSession.principalType, "org_user"),
          isNull(authSession.revokedAt),
          gt(authSession.expiresAt, now),
        ),
      ),
  ]);

  return { adminSessions, ownerSessions, orgUserSessions };
}
