import { db } from "@hesapport-api/db";
import { branch, organization, organizationRole } from "@hesapport-api/db/schema/organization";
import { env } from "@hesapport-api/env/server";
import { eq } from "drizzle-orm";

import { newId } from "../lib/id";
import { uniqueSlug, slugify } from "../lib/slug";
import {
  adminRolePermissions,
  memberRolePermissions,
  ownerPermissions,
  SYSTEM_ROLE_NAMES,
} from "../permissions/defaults";

export async function createOrganizationForOwner(input: {
  ownerId: string;
  name: string;
  businessName?: string | null;
}) {
  const orgName = input.businessName?.trim() || input.name;
  const slug = await uniqueSlug(orgName, async (s) => {
    const [row] = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, s))
      .limit(1);
    return Boolean(row);
  });

  const organizationId = newId();

  await db.insert(organization).values({
    id: organizationId,
    ownerId: input.ownerId,
    name: orgName,
    slug,
  });

  const defaultBranchId = newId();
  await db.insert(branch).values({
    id: defaultBranchId,
    organizationId,
    name: env.ORG_DEFAULT_BRANCH_NAME,
    isDefault: true,
  });

  const roles = [
    { name: SYSTEM_ROLE_NAMES.owner, permissions: ownerPermissions, isSystem: true },
    { name: SYSTEM_ROLE_NAMES.admin, permissions: adminRolePermissions, isSystem: true },
    { name: SYSTEM_ROLE_NAMES.member, permissions: memberRolePermissions, isSystem: true },
  ];

  for (const role of roles) {
    await db.insert(organizationRole).values({
      id: newId(),
      organizationId,
      name: role.name,
      permissions: role.permissions,
      isSystem: role.isSystem,
    });
  }

  return { organizationId, slug, defaultBranchId };
}

export function buildOwnerOrgName(name: string, businessName?: string | null) {
  return businessName?.trim() || name;
}

export function buildOwnerOrgSlugBase(name: string, businessName?: string | null) {
  return slugify(buildOwnerOrgName(name, businessName));
}
