import { db } from "@hesapport-api/db";
import { orgUser } from "@hesapport-api/db/schema/organization";
import { branch, organization, organizationRole } from "@hesapport-api/db/schema/organization";
import { and, eq } from "drizzle-orm";

import { sendOrgUserWelcomeEmail } from "../email";
import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import { hashPassword } from "../lib/password";
import { hasPermission } from "../permissions/defaults";
import { getRolePermissions } from "./permission.service";

export async function createOrgUser(input: {
  organizationId: string;
  branchId: string;
  roleId: string;
  username: string;
  password: string;
  displayName: string;
  notifyEmail?: string;
}) {
  const username = input.username.trim().toLowerCase();

  const [existing] = await db
    .select({ id: orgUser.id })
    .from(orgUser)
    .where(and(eq(orgUser.organizationId, input.organizationId), eq(orgUser.username, username)))
    .limit(1);

  if (existing) throw AuthErrors.usernameTaken();

  const [branchRow] = await db
    .select()
    .from(branch)
    .where(and(eq(branch.id, input.branchId), eq(branch.organizationId, input.organizationId)))
    .limit(1);

  if (!branchRow) throw AuthErrors.notFound("Branch");

  const [roleRow] = await db
    .select()
    .from(organizationRole)
    .where(
      and(
        eq(organizationRole.id, input.roleId),
        eq(organizationRole.organizationId, input.organizationId),
      ),
    )
    .limit(1);

  if (!roleRow) throw AuthErrors.notFound("Role");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, input.organizationId))
    .limit(1);

  if (!org) throw AuthErrors.notFound("Organization");

  const passwordHash = await hashPassword(input.password);
  const id = newId();

  const [row] = await db
    .insert(orgUser)
    .values({
      id,
      organizationId: input.organizationId,
      branchId: input.branchId,
      roleId: input.roleId,
      username,
      passwordHash,
      displayName: input.displayName,
      isActive: true,
    })
    .returning();

  if (!row) throw new Error("Failed to create org user");

  sendOrgUserWelcomeEmail({
    to: input.notifyEmail,
    displayName: row.displayName,
    organizationName: org.name,
    username: row.username,
    organizationSlug: org.slug,
  });

  return row;
}

export async function assertOrgPermission(input: {
  organizationId: string;
  roleId: string;
  resource: string;
  action: string;
}) {
  const permissions = await getRolePermissions(input.organizationId, input.roleId);
  if (!hasPermission(permissions, input.resource, input.action)) {
    throw AuthErrors.forbidden();
  }
}

export async function listOrgUsers(organizationId: string) {
  return db.select().from(orgUser).where(eq(orgUser.organizationId, organizationId));
}

export async function updateOrgUser(
  organizationId: string,
  orgUserId: string,
  data: Partial<{
    branchId: string;
    roleId: string;
    displayName: string;
    isActive: boolean;
    password: string;
  }>,
) {
  const [existing] = await db
    .select()
    .from(orgUser)
    .where(and(eq(orgUser.id, orgUserId), eq(orgUser.organizationId, organizationId)))
    .limit(1);

  if (!existing) throw AuthErrors.notFound("Org user");

  const patch: Partial<typeof orgUser.$inferInsert> = {};
  if (data.branchId !== undefined) patch.branchId = data.branchId;
  if (data.roleId !== undefined) patch.roleId = data.roleId;
  if (data.displayName !== undefined) patch.displayName = data.displayName;
  if (data.isActive !== undefined) patch.isActive = data.isActive;
  if (data.password !== undefined) patch.passwordHash = await hashPassword(data.password);

  const [row] = await db
    .update(orgUser)
    .set(patch)
    .where(eq(orgUser.id, orgUserId))
    .returning();

  return row;
}

export async function deleteOrgUser(organizationId: string, orgUserId: string) {
  const [row] = await db
    .delete(orgUser)
    .where(and(eq(orgUser.id, orgUserId), eq(orgUser.organizationId, organizationId)))
    .returning();
  if (!row) throw AuthErrors.notFound("Org user");
  return row;
}
