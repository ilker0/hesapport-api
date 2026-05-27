import { Router } from "express";

import { adminAuthRouter } from "./auth";
import { adminOrganizationsRouter } from "./organizations";
import { adminOwnersRouter } from "./owners";
import { adminSessionsRouter } from "./sessions";

export function createAdminRouter() {
  const router = Router();

  router.use("/auth", adminAuthRouter);
  router.use("/sessions", adminSessionsRouter);
  router.use("/owners", adminOwnersRouter);
  router.use("/organizations", adminOrganizationsRouter);

  return router;
}
