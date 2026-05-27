import { Router } from "express";

import { adminAuthRouter } from "./auth";
import { adminOrganizationsRouter } from "./organizations";
import { adminOwnersRouter } from "./owners";

export function createAdminRouter() {
  const router = Router();

  router.use("/auth", adminAuthRouter);
  router.use("/owners", adminOwnersRouter);
  router.use("/organizations", adminOrganizationsRouter);

  return router;
}
