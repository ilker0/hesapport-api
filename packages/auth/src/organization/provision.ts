import { db } from "@hesapport-api/db";
import { member } from "@hesapport-api/db/schema/organization";
import { and, eq } from "drizzle-orm";

import { organizationCreatorRole } from "./access";
import { buildOrganizationName, buildOrganizationSlug } from "./slug";

export type AuthWithOrganization = {
  api: {
    createOrganization: (input: {
      body: {
        name: string;
        slug: string;
        userId: string;
      };
    }) => Promise<{ id: string } | null>;
  };
};

export type ProvisionUser = {
  id: string;
  name: string;
  email: string;
  businessName?: string | null;
};

export async function getPrimaryOrganizationId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1);

  return row?.organizationId ?? null;
}

export async function userHasOrganization(userId: string): Promise<boolean> {
  return (await getPrimaryOrganizationId(userId)) !== null;
}

export async function provisionUserOrganization(
  authInstance: AuthWithOrganization,
  user: ProvisionUser,
): Promise<void> {
  if (await userHasOrganization(user.id)) {
    return;
  }

  const organization = await authInstance.api.createOrganization({
    body: {
      name: buildOrganizationName(user),
      slug: buildOrganizationSlug(user),
      userId: user.id,
    },
  });

  if (organization?.id) {
    await db
      .update(member)
      .set({ role: organizationCreatorRole })
      .where(
        and(eq(member.userId, user.id), eq(member.organizationId, organization.id)),
      );
  }
}
