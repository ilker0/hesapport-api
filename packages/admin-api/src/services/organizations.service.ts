import { db } from "@hesapport-api/db";
import { organization, branch, organizationRole } from "@hesapport-api/db/schema/organization";
import { orgUser } from "@hesapport-api/db/schema/organization";
import { owner } from "@hesapport-api/db/schema/owner";
import { AuthErrors } from "@hesapport-api/auth";
import { eq } from "drizzle-orm";

export async function listOrganizations() {
  return db
    .select({
      organization,
      owner: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
      },
    })
    .from(organization)
    .innerJoin(owner, eq(organization.ownerId, owner.id));
}

export async function getOrganization(organizationId: string) {
  const [row] = await db
    .select({
      organization,
      owner,
    })
    .from(organization)
    .innerJoin(owner, eq(organization.ownerId, owner.id))
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (!row) throw AuthErrors.notFound("Organization");

  const branches = await db
    .select()
    .from(branch)
    .where(eq(branch.organizationId, organizationId));

  const roles = await db
    .select()
    .from(organizationRole)
    .where(eq(organizationRole.organizationId, organizationId));

  const users = await db
    .select()
    .from(orgUser)
    .where(eq(orgUser.organizationId, organizationId));

  return { ...row, branches, roles, users };
}
