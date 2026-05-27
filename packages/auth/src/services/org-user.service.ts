import { db } from "@hesapport-api/db";
import { orgUser, orgUserRole } from "@hesapport-api/db/schema/organization";
import { branch, organization, organizationRole } from "@hesapport-api/db/schema/organization";
import { and, eq } from "drizzle-orm";

import { sendOrgUserWelcomeEmail } from "../email";
import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import { hashPassword } from "../lib/password";
import { hasPermission } from "../permissions/defaults";
import { getMergedRolePermissions } from "./permission.service";

export async function createOrgUser(input: {
  organizationId: string;
  branchId: string;
  roleIds: string[];
  email: string;
  username: string;
  password: string;
  displayName: string;
}) {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();

  const [existingByUsername] = await db
    .select({ id: orgUser.id })
    .from(orgUser)
    .where(and(eq(orgUser.organizationId, input.organizationId), eq(orgUser.username, username)))
    .limit(1);

  if (existingByUsername) throw AuthErrors.usernameTaken();

  const [existingByEmail] = await db
    .select({ id: orgUser.id })
    .from(orgUser)
    .where(and(eq(orgUser.organizationId, input.organizationId), eq(orgUser.email, email)))
    .limit(1);

  if (existingByEmail) throw AuthErrors.emailTaken();

  const [branchRow] = await db
    .select()
    .from(branch)
    .where(and(eq(branch.id, input.branchId), eq(branch.organizationId, input.organizationId)))
    .limit(1);

  if (!branchRow) throw AuthErrors.notFound("Branch");

  const roleRows = await db
    .select()
    .from(organizationRole)
    .where(eq(organizationRole.organizationId, input.organizationId));

  const validRoleIds = new Set(roleRows.map((r) => r.id));
  const normalizedRoleIds = [...new Set(input.roleIds)];
  if (normalizedRoleIds.some((id) => !validRoleIds.has(id))) {
    throw AuthErrors.notFound("Role");
  }

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
      email,
      username,
      passwordHash,
      displayName: input.displayName,
      isActive: true,
    })
    .returning();

  if (!row) throw new Error("Failed to create org user");

  await db.insert(orgUserRole).values(
    normalizedRoleIds.map((roleId) => ({
      id: newId(),
      orgUserId: row.id,
      roleId,
    })),
  );

  sendOrgUserWelcomeEmail({
    to: row.email,
    displayName: row.displayName,
    organizationName: org.name,
    email: row.email,
    username: row.username,
    password: input.password,
    organizationSlug: org.slug,
  });

  return row;
}

export async function assertOrgPermission(input: {
  organizationId: string;
  roleIds: string[];
  resource: string;
  action: string;
}) {
  const permissions = await getMergedRolePermissions(input.organizationId, input.roleIds);
  if (!hasPermission(permissions, input.resource, input.action)) {
    throw AuthErrors.forbidden();
  }
}

export async function listOrgUsers(organizationId: string) {
  const users = await db.select().from(orgUser).where(eq(orgUser.organizationId, organizationId));
  const userRoles = await db
    .select()
    .from(orgUserRole)
    .innerJoin(organizationRole, eq(organizationRole.id, orgUserRole.roleId))
    .where(eq(organizationRole.organizationId, organizationId));

  return users.map((user) => ({
    ...user,
    roleIds: userRoles.filter((r) => r.org_user_role.orgUserId === user.id).map((r) => r.org_user_role.roleId),
  }));
}

export async function updateOrgUser(
  organizationId: string,
  orgUserId: string,
  data: Partial<{
    branchId: string;
    roleIds: string[];
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
  if (data.displayName !== undefined) patch.displayName = data.displayName;
  if (data.isActive !== undefined) patch.isActive = data.isActive;
  if (data.password !== undefined) patch.passwordHash = await hashPassword(data.password);

  const [row] = await db
    .update(orgUser)
    .set(patch)
    .where(eq(orgUser.id, orgUserId))
    .returning();

  if (data.roleIds) {
    const roleRows = await db
      .select()
      .from(organizationRole)
      .where(eq(organizationRole.organizationId, organizationId));
    const validRoleIds = new Set(roleRows.map((r) => r.id));
    const normalizedRoleIds = [...new Set(data.roleIds)];
    if (normalizedRoleIds.some((id) => !validRoleIds.has(id))) {
      throw AuthErrors.notFound("Role");
    }

    await db.delete(orgUserRole).where(eq(orgUserRole.orgUserId, orgUserId));
    await db.insert(orgUserRole).values(
      normalizedRoleIds.map((roleId) => ({
        id: newId(),
        orgUserId,
        roleId,
      })),
    );
  }

  return row;
}

export async function deleteOrgUser(organizationId: string, orgUserId: string) {
  await db.delete(orgUserRole).where(eq(orgUserRole.orgUserId, orgUserId));
  const [row] = await db
    .delete(orgUser)
    .where(and(eq(orgUser.id, orgUserId), eq(orgUser.organizationId, organizationId)))
    .returning();
  if (!row) throw AuthErrors.notFound("Org user");
  return row;
}
