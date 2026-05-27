import {
  ownerForgotPassword,
  ownerResendVerification,
  ownerResetPassword,
  ownerSignIn,
  ownerSignUp,
  orgUserSignIn,
} from "@hesapport-api/auth";
import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { withAuth } from "../lib/auth-handler";
import {
  emailOnlySchema,
  orgUserSignInSchema,
  ownerSignInSchema,
  ownerSignUpSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

export const authRouter = Router();

authRouter.post(
  "/owner/sign-up",
  asyncHandler(async (req, res) => {
    const body = ownerSignUpSchema.parse(req.body);
    const result = await withAuth(() => ownerSignUp(body));
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/owner/sign-in",
  asyncHandler(async (req, res) => {
    const body = ownerSignInSchema.parse(req.body);
    const result = await withAuth(() => ownerSignIn(body));
    res.json({
      accessToken: result.accessToken,
      tokenType: "Bearer",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        businessName: result.user.businessName,
      },
      organizationId: result.session.organizationId,
    });
  }),
);

authRouter.post(
  "/owner/forgot-password",
  asyncHandler(async (req, res) => {
    const { email } = emailOnlySchema.parse(req.body);
    await ownerForgotPassword(email);
    res.json({ ok: true });
  }),
);

authRouter.post(
  "/owner/reset-password",
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body);
    await withAuth(() => ownerResetPassword(body));
    res.json({ ok: true });
  }),
);

authRouter.post(
  "/owner/resend-verification",
  asyncHandler(async (req, res) => {
    const { email } = emailOnlySchema.parse(req.body);
    await ownerResendVerification(email);
    res.json({ ok: true });
  }),
);

authRouter.post(
  "/org/sign-in",
  asyncHandler(async (req, res) => {
    const body = orgUserSignInSchema.parse(req.body);
    const result = await withAuth(() => orgUserSignIn(body));
    res.json({
      accessToken: result.accessToken,
      tokenType: "Bearer",
      user: {
        id: result.user.id,
        username: result.user.username,
        displayName: result.user.displayName,
        branchId: result.user.branchId,
        roleId: result.user.roleId,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug,
      },
    });
  }),
);
