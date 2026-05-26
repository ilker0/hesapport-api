import {
  changeEmailTemplate,
  organizationInvitationTemplate,
  passwordResetTemplate,
  verifyEmailTemplate,
} from "./email/templates";
import { dispatchResendEmail } from "./email/resend";
import { appendEmailVerificationCallback } from "./verification-callback";

export { APP_NAME } from "./email/constants";
export { isResendConfigured } from "./email/resend";

export function sendOrganizationInvitationEmail(input: {
  to: string;
  inviteLink: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: string;
}) {
  const message = organizationInvitationTemplate(input);
  dispatchResendEmail({ to: input.to, ...message });
}

export function sendPasswordResetEmail(input: {
  to: string;
  resetLink: string;
  userName?: string | null;
}) {
  const message = passwordResetTemplate(input);
  dispatchResendEmail({ to: input.to, ...message });
}

export function sendVerificationEmail(input: {
  to: string;
  verificationUrl: string;
  userName?: string | null;
}) {
  const message = verifyEmailTemplate({
    ...input,
    verificationUrl: appendEmailVerificationCallback(input.verificationUrl),
  });
  dispatchResendEmail({ to: input.to, ...message });
}

export function sendChangeEmailConfirmation(input: {
  to: string;
  confirmationLink: string;
  newEmail: string;
  currentEmail: string;
  userName?: string | null;
}) {
  const message = changeEmailTemplate(input);
  dispatchResendEmail({ to: input.to, ...message });
}
