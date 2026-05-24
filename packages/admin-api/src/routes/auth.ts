import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { forwardAuthCookies, parseJsonResponse } from "@hesapport-api/api/lib/http";
import { attachSession } from "@hesapport-api/api/middleware/session";
import { Router } from "express";

import { requireAdmin } from "../middleware/require-admin";
import { adminLoginSchema } from "../schemas/auth.schema";
import { adminLogin, adminLogout, getAdminSessionForUser } from "../services/auth.service";

export const adminAuthRouter = Router();

adminAuthRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = adminLoginSchema.parse(req.body);
    const { payload, signInResponse } = await adminLogin(input, req);

    forwardAuthCookies(signInResponse, res);
    res.json(payload);
  }),
);

adminAuthRouter.post(
  "/logout",
  attachSession,
  asyncHandler(async (req, res) => {
    const response = await adminLogout(req);

    forwardAuthCookies(response, res);
    res.status(response.status).json(await parseJsonResponse(response));
  }),
);

adminAuthRouter.get(
  "/session",
  attachSession,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = await getAdminSessionForUser(req.session!);
    res.json(payload);
  }),
);
