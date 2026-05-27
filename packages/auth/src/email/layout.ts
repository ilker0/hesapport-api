import { APP_NAME } from "./constants";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function emailButton(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(label)}</a></p>`;
}

export function emailMuted(html: string) {
  return `<p style="color:#666;font-size:13px">${html}</p>`;
}

export function emailLayout(body: string) {
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:0 auto;padding:24px">
    <p style="font-weight:600;font-size:18px">${escapeHtml(APP_NAME)}</p>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:32px 0" />
    <p style="color:#999;font-size:12px">Bu e-postayı siz talep etmediyseniz yok sayabilirsiniz.</p>
  </body></html>`;
}
