import { env, getApiPublicUrl } from "@hesapport-api/env/server";

import { dispatchResendEmail } from "./resend";
import { orgUserWelcomeTemplate, passwordResetTemplate, verifyEmailTemplate } from "./templates";

export { isResendConfigured } from "./resend";
export { APP_NAME } from "./constants";

function verificationUrl(rawToken: string, principal: "admin" | "owner") {
  const base = getApiPublicUrl().replace(/\/$/, "");
  return `${base}/auth/verify-email?token=${encodeURIComponent(rawToken)}&type=${principal}`;
}

function passwordResetUrl(rawToken: string, principal: "admin" | "owner") {
  const base = env.APP_ORIGIN.replace(/\/$/, "");
  return `${base}/auth/reset-password?token=${encodeURIComponent(rawToken)}&type=${principal}`;
}

export function sendVerifyEmail(input: {
  to: string;
  userName?: string | null;
  rawToken: string;
  principal: "admin" | "owner";
}) {
  const message = verifyEmailTemplate({
    userName: input.userName,
    verificationUrl: verificationUrl(input.rawToken, input.principal),
  });
  dispatchResendEmail({ to: input.to, ...message });
}

export function sendPasswordResetEmail(input: {
  to: string;
  userName?: string | null;
  rawToken: string;
  principal: "admin" | "owner";
}) {
  const message = passwordResetTemplate({
    userName: input.userName,
    resetUrl: passwordResetUrl(input.rawToken, input.principal),
  });
  dispatchResendEmail({ to: input.to, ...message });
}

export function sendOrgUserWelcomeEmail(input: {
  to?: string;
  displayName: string;
  organizationName: string;
  username: string;
  organizationSlug: string;
}) {
  const loginUrl = `${env.APP_ORIGIN.replace(/\/$/, "")}/login/${input.organizationSlug}`;
  const message = orgUserWelcomeTemplate({
    displayName: input.displayName,
    organizationName: input.organizationName,
    username: input.username,
    loginUrl,
  });
  if (input.to) {
    dispatchResendEmail({ to: input.to, ...message });
  }
}
