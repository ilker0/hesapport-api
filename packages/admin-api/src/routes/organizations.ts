import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { attachSession } from "@hesapport-api/api/middleware/session";
import { Router } from "express";

import { requireAdmin } from "../middleware/require-admin";
import {
  checkOrganizationSlugSchema,
  createOrganizationSchema,
  organizationIdParamSchema,
  updateOrganizationSchema,
} from "../schemas/organization.schema";
import * as organizationsService from "../services/organizations.service";

export const adminOrganizationsRouter = Router();

adminOrganizationsRouter.use(attachSession, requireAdmin);

adminOrganizationsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await organizationsService.listOrganizations());
  }),
);

adminOrganizationsRouter.post(
  "/check-slug",
  asyncHandler(async (req, res) => {
    const body = checkOrganizationSlugSchema.parse(req.body);
    res.json(await organizationsService.checkOrganizationSlug(req, body));
  }),
);

adminOrganizationsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = organizationIdParamSchema.parse(req.params.id);
    res.json(await organizationsService.getOrganization(req, id));
  }),
);

adminOrganizationsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createOrganizationSchema.parse(req.body);
    const organization = await organizationsService.createOrganization(input);
    res.status(201).json({ organization });
  }),
);

adminOrganizationsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = organizationIdParamSchema.parse(req.params.id);
    const body = updateOrganizationSchema.parse(req.body);
    res.json(await organizationsService.updateOrganization(req, id, body));
  }),
);

adminOrganizationsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = organizationIdParamSchema.parse(req.params.id);
    res.json(await organizationsService.deleteOrganization(req, id));
  }),
);
