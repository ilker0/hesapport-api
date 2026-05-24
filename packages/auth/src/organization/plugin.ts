import { env } from "@hesapport-api/env/server";
import { organization } from "better-auth/plugins";

export function createOrganizationPlugin() {
  const inviteBaseUrl = env.CORS_ORIGIN.replace(/\/$/, "");

  return organization({
    allowUserToCreateOrganization: true,
    organizationLimit: 1,
    creatorRole: "owner",
    membershipLimit: 100,
    async sendInvitationEmail(data) {
      const inviteLink = `${inviteBaseUrl}/accept-invitation/${data.id}`;

      if (env.NODE_ENV !== "production") {
        console.error(
          `[organization invitation] ${data.email} invited to "${data.organization.name}" by ${data.inviter.user.email}`,
        );
        console.error(`[organization invitation] link: ${inviteLink}`);
        return;
      }

      // TODO: plug in your email provider (Resend, SES, etc.)
      console.error(
        `[organization invitation] send email to ${data.email}: ${inviteLink}`,
      );
    },
  });
}
