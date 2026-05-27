import { listAdminSessions, revokeAuthSessionById } from "@hesapport-api/auth";
import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { withAuth } from "@hesapport-api/api/lib/auth-handler";
import { parseIdParam } from "@hesapport-api/api/lib/session";
import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAdmin } from "../middleware/require-admin";

export const adminSessionsRouter = Router();

adminSessionsRouter.use(attachSession, requireAdmin);

adminSessionsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sessions = await withAuth(() => listAdminSessions());
    res.json(sessions);
  }),
);

adminSessionsRouter.post(
  "/:id/revoke",
  asyncHandler(async (req, res) => {
    const sessionId = parseIdParam(req.params.id);
    const session = await withAuth(() => revokeAuthSessionById(sessionId));
    res.json({ session });
  }),
);
