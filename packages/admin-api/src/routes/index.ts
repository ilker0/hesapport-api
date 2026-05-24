import { Router } from "express";

import { adminAuthRouter } from "./auth";
import { adminOrganizationsRouter } from "./organizations";
import { adminUsersRouter } from "./users";

export function createAdminRouter() {
  const router = Router();

  router.use("/auth", adminAuthRouter);
  router.use("/users", adminUsersRouter);
  router.use("/organizations", adminOrganizationsRouter);

  return router;
}
