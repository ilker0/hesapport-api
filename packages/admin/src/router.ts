import { Router } from "express";

import { adminAuthRouter } from "./routes/auth";
import { adminPermissionsRouter } from "./routes/permissions";
import { adminRolesRouter } from "./routes/roles";
import { adminUsersRouter } from "./routes/users";

export function createAdminRouter() {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      name: "Hesapport Admin API",
      auth: {
        login: "POST /admin/auth/login",
        logout: "POST /admin/auth/logout",
        session: "GET /admin/auth/session",
      },
      resources: ["users", "roles", "permissions"],
    });
  });

  router.use("/auth", adminAuthRouter);
  router.use("/users", adminUsersRouter);
  router.use("/roles", adminRolesRouter);
  router.use("/permissions", adminPermissionsRouter);

  return router;
}
