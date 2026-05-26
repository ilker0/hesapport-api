import { APP_NAME } from "./constants";

export function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 24px;font-size:18px;font-weight:600;">${APP_NAME}</p>
              ${content}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#71717a;">© ${new Date().getFullYear()} ${APP_NAME}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string) {
  return `<p style="margin:24px 0;">
  <a href="${href}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:500;">${label}</a>
</p>`;
}

export function emailMuted(text: string) {
  return `<p style="margin:16px 0 0;font-size:13px;color:#71717a;line-height:1.5;">${text}</p>`;
}
