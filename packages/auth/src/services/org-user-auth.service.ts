import { db } from "@hesapport-api/db";
import { orgUser } from "@hesapport-api/db/schema/organization";
import { organization } from "@hesapport-api/db/schema/organization";
import { and, eq } from "drizzle-orm";

import { AuthErrors } from "../lib/errors";
import { signAccessToken } from "../lib/jwt";
import { verifyPassword } from "../lib/password";
import type { OrgUserSession } from "../types";

function toSession(
  row: typeof orgUser.$inferSelect,
): OrgUserSession {
  return {
    type: "org_user",
    sub: row.id,
    username: row.username,
    displayName: row.displayName,
    organizationId: row.organizationId,
    branchId: row.branchId,
    roleId: row.roleId,
  };
}

export async function orgUserSignIn(input: {
  organizationSlug: string;
  username: string;
  password: string;
}) {
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

  const session = toSession(row);
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row, organization: org, session };
}

export async function getOrgUserById(id: string) {
  const [row] = await db.select().from(orgUser).where(eq(orgUser.id, id)).limit(1);
  return row ?? null;
}
