import { db } from "@hesapport-api/db";
import { member as memberTable } from "@hesapport-api/db/schema/organization";
import { env } from "@hesapport-api/env/server";
import { organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import {
  organizationAccessControl,
  organizationCreatorRole,
  organizationRoles,
} from "./access";
import { sendOrganizationInvitationEmail } from "../email";
import { defaultOrganizationTeamName, organizationTeamsConfig } from "./teams";

function formatInvitationRole(role: string | string[]): string {
  const roles = Array.isArray(role) ? role : role.split(",");
  return roles.map((r) => r.trim()).filter(Boolean).join(", ");
}

export function createOrganizationPlugin() {
  const inviteBaseUrl = env.APP_ORIGIN.replace(/\/$/, "");

  return organization({
    ac: organizationAccessControl,
    roles: organizationRoles,
    allowUserToCreateOrganization: true,
    organizationLimit: 1,
    creatorRole: organizationCreatorRole,
    keepCurrentActiveOrganization: true,

    // membershipLimit: 100,
    requireEmailVerificationOnInvitation: true,
    dynamicAccessControl: {
      enabled: true,
      // maximumRolesPerOrganization: 50,
    },
    teams: organizationTeamsConfig,
    organizationHooks: {
      beforeAddMember: async ({ member, organization }) => {
        const [existing] = await db
          .select({ id: memberTable.id })
          .from(memberTable)
          .where(eq(memberTable.organizationId, organization.id))
          .limit(1);

        if (!existing) {
          return {
            data: {
              ...member,
              role: organizationCreatorRole,
            },
          };
        }
      },
      beforeCreateTeam: async ({ team, organization }) => {
        if (team.name === organization.name) {
          return {
            data: {
              ...team,
              name: defaultOrganizationTeamName,
            },
          };
        }
      },
    },
    async sendInvitationEmail(data) {
      const inviteLink = `${inviteBaseUrl}/auth/accept-invitation/${data.id}`;

      sendOrganizationInvitationEmail({
        to: data.email,
        inviteLink,
        inviterName: data.inviter.user.name,
        inviterEmail: data.inviter.user.email,
        organizationName: data.organization.name,
        role: formatInvitationRole(data.role),
      });
    },
  });
}
