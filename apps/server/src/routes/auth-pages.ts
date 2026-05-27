import { adminVerifyEmail, ownerVerifyEmail } from "@hesapport-api/auth";
import { Router } from "express";
import { z } from "zod";

export const authPagesRouter = Router();

const verifyQuerySchema = z.object({
  token: z.string().min(1),
  type: z.enum(["admin", "owner"]),
});

authPagesRouter.get("/verify-email", async (req, res) => {
  const query = verifyQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).send("Invalid verification link");
    return;
  }

  try {
    const result =
      query.data.type === "admin"
        ? await adminVerifyEmail(query.data.token)
        : await ownerVerifyEmail(query.data.token);

    res
      .status(200)
      .type("html")
      .send(
        `<!DOCTYPE html><html><body style="font-family:system-ui;padding:2rem"><h1>E-posta doğrulandı</h1><p>Hesabınız aktif. Giriş yapabilirsiniz.</p><p style="color:#666;font-size:13px">Token: ${result.accessToken.slice(0, 20)}…</p></body></html>`,
      );
  } catch {
    res.status(400).send("Link geçersiz veya süresi dolmuş");
  }
});
