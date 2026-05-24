import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAuth } from "../middleware/require-auth";
import { asyncHandler } from "../lib/async-handler";
import { organizationRouter } from "./organization";
import { todoRouter } from "./todo";

export function createAppRouter() {
  const router = Router();

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
        user: req.session!.user,
      });
    }),
  );

  router.use("/organization", organizationRouter);
  router.use("/todos", todoRouter);

  return router;
}
