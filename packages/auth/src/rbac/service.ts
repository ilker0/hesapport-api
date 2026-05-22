import { db } from "@hesapport-api/db";
import { user } from "@hesapport-api/db/schema/auth";
import { permission, role, rolePermission, userRole } from "@hesapport-api/db/schema/rbac";
import { and, eq, inArray } from "drizzle-orm";

import type { PermissionCheck } from "./types";

export async function getUserPermissions(userId: string): Promise<Record<string, string[]>> {
  const rows = await db
    .select({
      resource: permission.resource,
      action: permission.action,
    })
    .from(userRole)
    .innerJoin(rolePermission, eq(userRole.roleId, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(eq(userRole.userId, userId));

  const result: Record<string, string[]> = {};

  for (const row of rows) {
    const actions = result[row.resource] ?? [];
    if (!actions.includes(row.action)) {
      actions.push(row.action);
      result[row.resource] = actions;
    }
  }

  return result;
}

export async function userHasPermission(
  userId: string,
  required: PermissionCheck,
): Promise<boolean> {
  const granted = await getUserPermissions(userId);

  for (const [resource, actions] of Object.entries(required)) {
    const allowed = granted[resource] ?? [];
    if (!actions.every((action) => allowed.includes(action))) {
      return false;
    }
  }

  return true;
}

export async function getUserRoleNames(userId: string): Promise<string[]> {
  const rows = await db
    .select({ name: role.name })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId));

  return rows.map((row) => row.name);
}

export async function syncUserRoleField(userId: string): Promise<void> {
  const roleNames = await getUserRoleNames(userId);

  await db
    .update(user)
    .set({ role: roleNames.length > 0 ? roleNames.join(",") : "user" })
    .where(eq(user.id, userId));
}

export async function assignRoleToUserByName(userId: string, roleName: string): Promise<void> {
  const [targetRole] = await db.select().from(role).where(eq(role.name, roleName)).limit(1);

  if (!targetRole) {
    throw new Error(`Role not found: ${roleName}`);
  }

  const [existing] = await db
    .select()
    .from(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.roleId, targetRole.id)))
    .limit(1);

  if (!existing) {
    await db.insert(userRole).values({
      userId,
      roleId: targetRole.id,
    });
  }

  await syncUserRoleField(userId);
}

export async function removeRoleFromUserByName(userId: string, roleName: string): Promise<void> {
  const [targetRole] = await db.select().from(role).where(eq(role.name, roleName)).limit(1);

  if (!targetRole) {
    return;
  }

  await db
    .delete(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.roleId, targetRole.id)));

  await syncUserRoleField(userId);
}

export async function setUserRolesByName(userId: string, roleNames: string[]): Promise<void> {
  const roles = await db.select().from(role).where(inArray(role.name, roleNames));

  if (roles.length !== roleNames.length) {
    const found = new Set(roles.map((r) => r.name));
    const missing = roleNames.filter((name) => !found.has(name));
    throw new Error(`Roles not found: ${missing.join(", ")}`);
  }

  await db.delete(userRole).where(eq(userRole.userId, userId));

  if (roles.length > 0) {
    await db.insert(userRole).values(
      roles.map((r) => ({
        userId,
        roleId: r.id,
      })),
    );
  }

  await syncUserRoleField(userId);
}

export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  const roleNames = await getUserRoleNames(userId);
  return roleNames.includes(roleName);
}
