import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAuth } from "../middleware/require-auth";
import { asyncHandler } from "../lib/async-handler";
import { authRouter } from "./auth";
import { organizationRouter } from "./organization";
import { sessionsRouter } from "./sessions";

export function createAppRouter() {
  const router = Router();

  router.use("/auth", authRouter);

  router.use(attachSession);

  router.get("/health", (_req, res) => {
    res.json({ status: "OK" });
  });

  router.get(
    "/private",
    requireAuth,
    asyncHandler(async (req, res) => {
      res.json({
        message: "This is private",
        session: req.session,
      });
    }),
  );

  router.use("/organization", organizationRouter);
  router.use("/sessions", sessionsRouter);

  return router;
}
