import { APP_NAME } from "../email/constants";
import { getAppLoginUrl } from "../verification-callback";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  TOKEN_EXPIRED: {
    title: "Bağlantının süresi doldu",
    description:
      "Doğrulama bağlantısı artık geçerli değil. Giriş yapıp yeni bir doğrulama e-postası isteyebilirsiniz.",
  },
  INVALID_TOKEN: {
    title: "Geçersiz bağlantı",
    description: "Bu doğrulama bağlantısı kullanılamıyor. Lütfen e-postanızdaki en güncel bağlantıyı kullanın.",
  },
  USER_NOT_FOUND: {
    title: "Hesap bulunamadı",
    description: "Bu bağlantıyla eşleşen bir hesap yok. Yeniden kayıt olmayı deneyebilirsiniz.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderVerificationResultPage(errorCode?: string | null) {
  const loginUrl = getAppLoginUrl();
  const error = errorCode?.trim();
  const isSuccess = !error;

  const errorInfo = error
    ? (ERROR_MESSAGES[error] ?? {
      title: "Doğrulama tamamlanamadı",
      description: "Bir sorun oluştu. Lütfen tekrar deneyin veya destek ile iletişime geçin.",
    })
    : null;

  const icon = isSuccess
    ? `<div style="width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`
    : `<div style="width:64px;height:64px;margin:0 auto 24px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>`;

  const title = isSuccess ? "E-postanız doğrulandı" : escapeHtml(errorInfo!.title);
  const description = isSuccess
    ? "Hesabınız hazır. Artık giriş yapıp Hesapport'u kullanmaya başlayabilirsiniz."
    : escapeHtml(errorInfo!.description);

  const ctaLabel = isSuccess ? "Giriş yap" : "Giriş sayfasına dön";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${isSuccess ? "E-posta doğrulandı" : "Doğrulama hatası"} — ${APP_NAME}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(160deg, #f4f4f5 0%, #e4e4e7 100%);
      color: #18181b;
    }
    .card {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: 16px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,.06);
    }
    .brand {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #71717a;
      margin-bottom: 8px;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 24px;
      font-weight: 600;
      line-height: 1.3;
    }
    p {
      margin: 0 0 28px;
      font-size: 15px;
      line-height: 1.6;
      color: #52525b;
    }
    .btn {
      display: inline-block;
      background: #18181b;
      color: #fff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
    }
    .btn:hover { background: #27272a; }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #a1a1aa;
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="brand">${APP_NAME}</p>
    ${icon}
    <h1>${title}</h1>
    <p>${description}</p>
    <a class="btn" href="${escapeHtml(loginUrl)}/auth/login">${ctaLabel}</a>
    <p class="footer">© ${new Date().getFullYear()} ${APP_NAME}</p>
  </main>
</body>
</html>`;
}
