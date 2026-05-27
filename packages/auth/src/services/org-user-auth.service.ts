import { db } from "@hesapport-api/db";
import { orgUser, orgUserRole } from "@hesapport-api/db/schema/organization";
import { organization } from "@hesapport-api/db/schema/organization";
import { and, eq } from "drizzle-orm";

import { AuthErrors } from "../lib/errors";
import { signAccessToken } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import { buildSessionExpiresAt, createAuthSession } from "./session.service";
import type { OrgUserSession } from "../types";
import { env } from "@hesapport-api/env/server";

function toSession(
  row: typeof orgUser.$inferSelect,
  roleIds: string[],
): OrgUserSession {
  return {
    type: "org_user",
    sub: row.id,
    sessionId: "",
    username: row.username,
    displayName: row.displayName,
    organizationId: row.organizationId,
    branchId: row.branchId,
    roleIds,
  };
}

export async function orgUserSignIn(input: {
  organizationSlug: string;
  username: string;
  password: string;
}, meta?: { ipAddress?: string; userAgent?: string }) {
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, input.organizationSlug.trim().toLowerCase()))
    .limit(1);

  if (!org) throw AuthErrors.invalidCredentials();

  const username = input.username.trim().toLowerCase();

  const [row] = await db
    .select()
    .from(orgUser)
    .where(and(eq(orgUser.organizationId, org.id), eq(orgUser.username, username)))
    .limit(1);

  if (!row || !row.isActive || !(await verifyPassword(input.password, row.passwordHash))) {
    throw AuthErrors.invalidCredentials();
  }

  const roleRows = await db
    .select({ roleId: orgUserRole.roleId })
    .from(orgUserRole)
    .where(eq(orgUserRole.orgUserId, row.id));

  const roleIds = roleRows.map((r) => r.roleId);
  const baseSession = toSession(row, roleIds);
  const persisted = await createAuthSession({
    principalType: "org_user",
    principalId: row.id,
    organizationId: row.organizationId,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    expiresAt: buildSessionExpiresAt(env.JWT_EXPIRES_IN),
  });
  const session = { ...baseSession, sessionId: persisted.id };
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row, organization: org, session, persistedSession: persisted };
}

export async function getOrgUserById(id: string) {
  const [row] = await db.select().from(orgUser).where(eq(orgUser.id, id)).limit(1);
  return row ?? null;
}
