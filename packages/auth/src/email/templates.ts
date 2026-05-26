import { APP_NAME } from "./constants";
import { emailButton, emailLayout, emailMuted } from "./layout";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function organizationInvitationTemplate(input: {
  inviteLink: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: string;
}) {
  const org = escapeHtml(input.organizationName);
  const inviter = escapeHtml(input.inviterName);
  const role = escapeHtml(input.role);

  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      <strong>${inviter}</strong> sizi <strong>${org}</strong> organizasyonuna
      <strong>${role}</strong> rolüyle davet etti.
    </p>
    ${emailButton(input.inviteLink, "Daveti kabul et")}
    ${emailMuted(`Davet gönderen: ${escapeHtml(input.inviterEmail)}. Bu bağlantı 7 gün geçerlidir.`)}
  `);

  const text = `${inviter} sizi ${input.organizationName} organizasyonuna (${input.role}) davet etti.\n\nDaveti kabul et: ${input.inviteLink}`;

  return {
    subject: `${APP_NAME} — Organizasyon daveti`,
    html,
    text,
  };
}

export function passwordResetTemplate(input: {
  resetLink: string;
  userName?: string | null;
}) {
  const greeting = input.userName ? `Merhaba ${escapeHtml(input.userName)},` : "Merhaba,";

  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      ${APP_NAME} hesabınız için şifre sıfırlama talebi aldık. Aşağıdaki düğmeye tıklayarak yeni şifrenizi belirleyebilirsiniz.
    </p>
    ${emailButton(input.resetLink, "Şifremi sıfırla")}
    ${emailMuted("Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz. Bağlantı 60 dakika geçerlidir.")}
  `);

  const text = `Şifrenizi sıfırlamak için: ${input.resetLink}`;

  return {
    subject: `${APP_NAME} — Şifre sıfırlama`,
    html,
    text,
  };
}

export function verifyEmailTemplate(input: {
  verificationUrl: string;
  userName?: string | null;
}) {
  const greeting = input.userName ? `Merhaba ${escapeHtml(input.userName)},` : "Merhaba,";

  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      ${APP_NAME} hesabınızı kullanmaya başlamak için e-posta adresinizi doğrulayın.
    </p>
    ${emailButton(input.verificationUrl, "E-postamı doğrula")}
    ${emailMuted("Bağlantı 60 dakika geçerlidir.")}
  `);

  const text = `E-postanızı doğrulamak için: ${input.verificationUrl}`;

  return {
    subject: `${APP_NAME} — E-posta doğrulama`,
    html,
    text,
  };
}

export function changeEmailTemplate(input: {
  confirmationLink: string;
  newEmail: string;
  currentEmail: string;
  userName?: string | null;
}) {
  const greeting = input.userName ? `Merhaba ${escapeHtml(input.userName)},` : "Merhaba,";

  const html = emailLayout(`
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
      Hesabınızın e-posta adresini <strong>${escapeHtml(input.currentEmail)}</strong> adresinden
      <strong>${escapeHtml(input.newEmail)}</strong> adresine değiştirmek için onay gerekiyor.
    </p>
    ${emailButton(input.confirmationLink, "Değişikliği onayla")}
    ${emailMuted("Bu değişikliği siz talep etmediyseniz bu e-postayı yok sayın.")}
  `);

  const text = `E-posta değişikliğini onaylamak için: ${input.confirmationLink}`;

  return {
    subject: `${APP_NAME} — E-posta değişikliği onayı`,
    html,
    text,
  };
}
