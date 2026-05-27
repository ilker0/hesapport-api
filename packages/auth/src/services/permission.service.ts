import { db } from "@hesapport-api/db";
import { organizationRole } from "@hesapport-api/db/schema/organization";
import { and, eq, inArray } from "drizzle-orm";

import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import type { PermissionMap } from "../types";
import { hasPermission } from "../permissions/defaults";

export async function getRolePermissions(
  organizationId: string,
  roleId: string,
): Promise<PermissionMap> {
  const [row] = await db
    .select()
    .from(organizationRole)
    .where(and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)))
    .limit(1);

  if (!row) throw AuthErrors.notFound("Role");
  return row.permissions;
}

export async function getRoleByName(organizationId: string, name: string) {
  const [row] = await db
    .select()
    .from(organizationRole)
    .where(
      and(eq(organizationRole.organizationId, organizationId), eq(organizationRole.name, name)),
    )
    .limit(1);
  return row ?? null;
}

export async function checkOrgUserPermission(input: {
  organizationId: string;
  roleIds: string[];
  resource: string;
  action: string;
}) {
  const permissions = await getMergedRolePermissions(input.organizationId, input.roleIds);
  return hasPermission(permissions, input.resource, input.action);
}

export async function getMergedRolePermissions(
  organizationId: string,
  roleIds: string[],
): Promise<PermissionMap> {
  if (roleIds.length === 0) {
    return {};
  }

  const rows = await db
    .select()
    .from(organizationRole)
    .where(
      and(
        eq(organizationRole.organizationId, organizationId),
        inArray(organizationRole.id, roleIds),
      ),
    );

  const merged: PermissionMap = {};
  for (const row of rows) {
    for (const [resource, actions] of Object.entries(row.permissions)) {
      merged[resource] = [...new Set([...(merged[resource] ?? []), ...actions])];
    }
  }
  return merged;
}

export async function listOrganizationRoles(organizationId: string) {
  return db
    .select()
    .from(organizationRole)
    .where(eq(organizationRole.organizationId, organizationId));
}

export async function createOrganizationRole(input: {
  organizationId: string;
  name: string;
  permissions: PermissionMap;
}) {
  const [row] = await db
    .insert(organizationRole)
    .values({
      id: newId(),
      organizationId: input.organizationId,
      name: input.name,
      permissions: input.permissions,
      isSystem: false,
    })
    .returning();
  return row;
}

export async function updateOrganizationRole(
  organizationId: string,
  roleId: string,
  data: { name?: string; permissions?: PermissionMap },
) {
  const [existing] = await db
    .select()
    .from(organizationRole)
    .where(
      and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)),
    )
    .limit(1);

  if (!existing) throw AuthErrors.notFound("Role");
  if (existing.isSystem && data.name && data.name !== existing.name) {
    throw AuthErrors.forbidden();
  }

  const [row] = await db
    .update(organizationRole)
    .set({
      ...(data.name ? { name: data.name } : {}),
      ...(data.permissions ? { permissions: data.permissions } : {}),
    })
    .where(eq(organizationRole.id, roleId))
    .returning();

  return row;
}

export async function deleteOrganizationRole(organizationId: string, roleId: string) {
  const [existing] = await db
    .select()
    .from(organizationRole)
    .where(
      and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)),
    )
    .limit(1);

  if (!existing) throw AuthErrors.notFound("Role");
  if (existing.isSystem) throw AuthErrors.forbidden();

  const [row] = await db
    .delete(organizationRole)
    .where(eq(organizationRole.id, roleId))
    .returning();

  return row;
}
