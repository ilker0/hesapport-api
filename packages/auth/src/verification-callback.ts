import { env } from "@hesapport-api/env/server";

/** Doğrulama sonrası tarayıcı yönlendirmesi (HTML sonuç sayfası). */
export function getEmailVerificationCallbackUrl(): string {
  if (env.EMAIL_VERIFICATION_CALLBACK_URL) {
    return env.EMAIL_VERIFICATION_CALLBACK_URL;
  }

  const authBase = new URL(env.BETTER_AUTH_URL);
  return `${authBase.origin}/auth/verification/complete`;
}

export function getAppLoginUrl(): string {
  return env.APP_ORIGIN.replace(/\/$/, "");
}

/** Better Auth verify URL'sine sonuç sayfası callback'i ekler. */
export function appendEmailVerificationCallback(verificationUrl: string): string {
  const url = new URL(verificationUrl);
  url.searchParams.set("callbackURL", getEmailVerificationCallbackUrl());
  return url.toString();
}
