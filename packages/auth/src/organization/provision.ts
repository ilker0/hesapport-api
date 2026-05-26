import { db } from "@hesapport-api/db";
import { member } from "@hesapport-api/db/schema/organization";
import { eq } from "drizzle-orm";

import { buildOrganizationName, buildOrganizationSlug } from "./slug";
import { defaultOrganizationTeamName, organizationTeamsConfig } from "./teams";

export type AuthWithOrganization = {
  api: {
    createOrganization: (input: {
      body: {
        name: string;
        slug: string;
        userId: string;
      };
    }) => Promise<{ id: string } | null>;
    createTeam: (input: {
      body: {
        name: string;
        organizationId: string;
      };
    }) => Promise<unknown>;
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

  if (organizationTeamsConfig.enabled && organization?.id) {
    await authInstance.api.createTeam({
      body: {
        name: defaultOrganizationTeamName,
        organizationId: organization.id,
      },
    });
  }
}
