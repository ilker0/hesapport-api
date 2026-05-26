import { db } from "@hesapport-api/db";
import { organizationRole } from "@hesapport-api/db/schema/organization";
import {
  adminAc,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { and, eq } from "drizzle-orm";

export type OrganizationPermissionMap = Record<string, string[]>;

const builtInRoleStatements: Record<string, OrganizationPermissionMap> = {
  owner: ownerAc.statements as OrganizationPermissionMap,
  admin: adminAc.statements as OrganizationPermissionMap,
  member: memberAc.statements as OrganizationPermissionMap,
};

function parseMemberRoles(memberRole: string): string[] {
  return memberRole
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

function mergePermissions(
  target: OrganizationPermissionMap,
  source: OrganizationPermissionMap,
): OrganizationPermissionMap {
  const merged: OrganizationPermissionMap = { ...target };

  for (const [resource, actions] of Object.entries(source)) {
    merged[resource] = [...new Set([...(merged[resource] ?? []), ...actions])];
  }

  return merged;
}

/**
 * Aktif üyenin org içindeki birleşik izin haritası (built-in + dynamic roles).
 */
export async function resolveOrganizationMemberPermissions(
  organizationId: string,
  memberRole: string,
): Promise<{ roles: string[]; permissions: OrganizationPermissionMap }> {
  const roles = parseMemberRoles(memberRole);
  let permissions: OrganizationPermissionMap = {};

  for (const roleName of roles) {
    const builtIn = builtInRoleStatements[roleName.toLowerCase()];
    if (builtIn) {
      permissions = mergePermissions(permissions, builtIn);
      continue;
    }

    const [dynamicRole] = await db
      .select({ permission: organizationRole.permission })
      .from(organizationRole)
      .where(
        and(
          eq(organizationRole.organizationId, organizationId),
          eq(organizationRole.role, roleName.toLowerCase()),
        ),
      )
      .limit(1);

    if (!dynamicRole?.permission) {
      continue;
    }

    const parsed = JSON.parse(dynamicRole.permission) as OrganizationPermissionMap;
    permissions = mergePermissions(permissions, parsed);
  }

  return { roles, permissions };
}
