import {
  listOwnerOrgUserSessions,
  revokeOwnerOrgUserSession,
} from "@hesapport-api/auth";
import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { withAuth } from "../lib/auth-handler";
import { parseIdParam } from "../lib/session";
import { requireOwner } from "../middleware/require-auth";

export const sessionsRouter = Router();

sessionsRouter.use(requireOwner);

sessionsRouter.get(
  "/org-users",
  asyncHandler(async (req, res) => {
    const sessions = await withAuth(() => listOwnerOrgUserSessions(req.session!.sub));
    res.json({ sessions });
  }),
);

sessionsRouter.post(
  "/org-users/:id/revoke",
  asyncHandler(async (req, res) => {
    const sessionId = parseIdParam(req.params.id);
    const revoked = await withAuth(() => revokeOwnerOrgUserSession(req.session!.sub, sessionId));
    res.json({ session: revoked });
  }),
);
