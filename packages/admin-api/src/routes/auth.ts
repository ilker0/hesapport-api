import {
  adminForgotPassword,
  adminResendVerification,
  adminResetPassword,
  adminSignIn,
  adminVerifyEmail,
} from "@hesapport-api/auth";
import { withAuth } from "@hesapport-api/api/lib/auth-handler";
import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { buildRequestMeta } from "@hesapport-api/api/lib/request-meta";
import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAdmin } from "../middleware/require-admin";
import {
  adminSignInSchema,
  emailOnlySchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas/auth.schema";

export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/sign-in",
  asyncHandler(async (req, res) => {
    const body = adminSignInSchema.parse(req.body);
    const result = await withAuth(() => adminSignIn(body, buildRequestMeta(req)));
    res.json({
      accessToken: result.accessToken,
      tokenType: "Bearer",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    });
  }),
);

adminAuthRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = emailOnlySchema.parse(req.body);
    await adminForgotPassword(email);
    res.json({ ok: true });
  }),
);

adminAuthRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body);
    await withAuth(() => adminResetPassword(body));
    res.json({ ok: true });
  }),
);

adminAuthRouter.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = verifyEmailSchema.parse(req.body);
    const result = await withAuth(() => adminVerifyEmail(token));
    res.json({
      accessToken: result.accessToken,
      tokenType: "Bearer",
      user: result.user,
    });
  }),
);

adminAuthRouter.post(
  "/resend-verification",
  asyncHandler(async (req, res) => {
    const { email } = emailOnlySchema.parse(req.body);
    await adminResendVerification(email);
    res.json({ ok: true });
  }),
);

adminAuthRouter.get(
  "/me",
  attachSession,
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ session: req.session });
  }),
);
