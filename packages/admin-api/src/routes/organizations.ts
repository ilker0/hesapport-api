import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { withAuth } from "@hesapport-api/api/lib/auth-handler";
import { parseIdParam } from "@hesapport-api/api/lib/session";
import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAdmin } from "../middleware/require-admin";
import { createOrgUserAdminSchema } from "../schemas/owner.schema";
import * as organizationsService from "../services/organizations.service";
import * as orgUsersService from "../services/org-users.service";

export const adminOrganizationsRouter = Router();

adminOrganizationsRouter.use(attachSession, requireAdmin);

adminOrganizationsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await organizationsService.listOrganizations());
  }),
);

adminOrganizationsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(
      await withAuth(() => organizationsService.getOrganization(parseIdParam(req.params.id))),
    );
  }),
);

adminOrganizationsRouter.post(
  "/:id/users",
  asyncHandler(async (req, res) => {
    const body = createOrgUserAdminSchema.parse({
      ...req.body,
      organizationId: parseIdParam(req.params.id),
    });
    const row = await withAuth(() => orgUsersService.adminCreateOrgUser(body));
    res.status(201).json(row);
  }),
);
