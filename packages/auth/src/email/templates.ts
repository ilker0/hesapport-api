import { emailButton, emailLayout, emailMuted, escapeHtml } from "./layout";
import { APP_NAME } from "./constants";

export function verifyEmailTemplate(input: {
  userName?: string | null;
  verificationUrl: string;
}) {
  const name = input.userName ? escapeHtml(input.userName) : "Merhaba";
  const html = emailLayout(`
    <p>${name},</p>
    <p>${escapeHtml(APP_NAME)} hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın.</p>
    ${emailButton(input.verificationUrl, "E-postayı doğrula")}
    ${emailMuted("Bağlantı 24 saat geçerlidir.")}
  `);
  const text = `${APP_NAME} e-posta doğrulama: ${input.verificationUrl}`;
  return { subject: `${APP_NAME} — E-posta doğrulama`, html, text };
}

export function passwordResetTemplate(input: {
  userName?: string | null;
  resetUrl: string;
}) {
  const name = input.userName ? escapeHtml(input.userName) : "Merhaba";
  const html = emailLayout(`
    <p>${name},</p>
    <p>Şifre sıfırlama talebiniz alındı.</p>
    ${emailButton(input.resetUrl, "Şifreyi sıfırla")}
    ${emailMuted("Bu talebi siz yapmadıysanız bu e-postayı yok sayın.")}
  `);
  const text = `${APP_NAME} şifre sıfırlama: ${input.resetUrl}`;
  return { subject: `${APP_NAME} — Şifre sıfırlama`, html, text };
}

export function orgUserWelcomeTemplate(input: {
  displayName: string;
  organizationName: string;
  email: string;
  username: string;
  password: string;
  loginUrl: string;
}) {
  const html = emailLayout(`
    <p>Merhaba ${escapeHtml(input.displayName)},</p>
    <p><strong>${escapeHtml(input.organizationName)}</strong> organizasyonuna hesabınız oluşturuldu.</p>
    <p>E-posta adresiniz: <strong>${escapeHtml(input.email)}</strong></p>
    <p>Kullanıcı adınız: <strong>${escapeHtml(input.username)}</strong></p>
    <p>Şifreniz: <strong>${escapeHtml(input.password)}</strong></p>
    ${emailButton(input.loginUrl, "Giriş yap")}
    ${emailMuted("Güvenlik için giriş yaptıktan sonra şifrenizi değiştirin.")}
  `);
  const text = `Hesabınız oluşturuldu. E-posta: ${input.email}. Kullanıcı adı: ${input.username}. Şifre: ${input.password}. Giriş: ${input.loginUrl}`;
  return { subject: `${APP_NAME} — Hesabınız hazır`, html, text };
}
