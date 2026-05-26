import { env } from "@hesapport-api/env/server";
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith("re_xxxx") || apiKey.startsWith("your-")) {
    return null;
  }
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

export function isResendConfigured(): boolean {
  return getResend() !== null;
}

type DispatchEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Resend ile e-posta gönderir (await edilmez — auth hook timing).
 * @see https://resend.com/docs/send-with-nodejs
 */
export function dispatchResendEmail(input: DispatchEmailInput) {
  if (env.NODE_ENV !== "production") {
    console.error(`[email] to=${input.to} subject=${input.subject}`);
    console.error(`[email] preview:\n${input.text}`);
  }

  const resend = getResend();

  if (!resend) {
    console.error("[email] skipped — set RESEND_API_KEY (https://resend.com/api-keys)");
    return;
  }

  if (env.NODE_ENV !== "production" && !env.EMAIL_SEND_IN_DEV) {
    console.error("[email] dev send disabled — set EMAIL_SEND_IN_DEV=true to deliver via Resend");
    return;
  }

  void resend.emails
    .send({
      from: env.RESEND_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    })
    .then(({ data, error }) => {
      if (error) {
        console.error("[email] Resend error:", error.message);
        return;
      }
      if (env.NODE_ENV !== "production" && data?.id) {
        console.error(`[email] sent id=${data.id}`);
      }
    });
}
