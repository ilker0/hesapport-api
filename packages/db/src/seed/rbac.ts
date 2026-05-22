import { db } from "../index";
import { permission, role, rolePermission } from "../schema/rbac";
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLES,
} from "./rbac-defaults";

export async function seedRbacDefaults() {
  for (const perm of DEFAULT_PERMISSIONS) {
    await db
      .insert(permission)
      .values({
        id: perm.id,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      })
      .onConflictDoNothing({ target: permission.id });
  }

  for (const roleRow of DEFAULT_ROLES) {
    await db
      .insert(role)
      .values({
        id: roleRow.id,
        name: roleRow.name,
        displayName: roleRow.displayName,
        description: roleRow.description,
        isSystem: roleRow.isSystem,
      })
      .onConflictDoNothing({ target: role.id });
  }

  for (const [roleName, permissionIds] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const roleRow = DEFAULT_ROLES.find((r) => r.name === roleName);
    if (!roleRow) continue;

    for (const permissionId of permissionIds) {
      await db
        .insert(rolePermission)
        .values({
          roleId: roleRow.id,
          permissionId,
        })
        .onConflictDoNothing({
          target: [rolePermission.roleId, rolePermission.permissionId],
        });
    }
  }

  console.log("RBAC defaults seeded (roles, permissions, role_permission)");
}
