import { db } from "@hesapport-api/db";
import { member } from "@hesapport-api/db/schema/organization";
import { eq } from "drizzle-orm";

import { buildOrganizationName, buildOrganizationSlug } from "./slug";

export type AuthWithOrganization = {
  api: {
    createOrganization: (input: {
      body: {
        name: string;
        slug: string;
        userId: string;
      };
    }) => Promise<unknown>;
  };
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
  user: { id: string; name: string; email: string },
): Promise<void> {
  if (await userHasOrganization(user.id)) {
    return;
  }

  await authInstance.api.createOrganization({
    body: {
      name: buildOrganizationName(user),
      slug: buildOrganizationSlug(user),
      userId: user.id,
    },
  });
}
