import { auth } from "@hesapport-api/auth";
import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { requireAuth } from "../middleware/require-auth";
import {
  createOrgRoleSchema,
  deleteOrgRoleSchema,
  getOrgRoleQuerySchema,
  getMemberPermissionsQuerySchema,
  hasPermissionSchema,
  updateOrgRoleSchema,
} from "../schemas/org-role.schema";
import {
  inviteMemberSchema,
  removeMemberSchema,
  setActiveOrganizationSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "../schemas/organization.schema";
import * as organizationService from "../services/organization.service";
import { teamsRouter } from "./teams";

export const organizationRouter = Router();

organizationRouter.use(requireAuth);

organizationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await organizationService.listOrganizations(req));
  }),
);

organizationRouter.get(
  "/active",
  asyncHandler(async (req, res) => {
    res.json(await organizationService.getActiveOrganization(req));
  }),
);

organizationRouter.get(
  "/active/member",
  asyncHandler(async (req, res) => {
    res.json(await organizationService.getActiveMember(req));
  }),
);

organizationRouter.post(
  "/active",
  asyncHandler(async (req, res) => {
    const body = setActiveOrganizationSchema.parse(req.body);
    res.json(await organizationService.setActiveOrganization(req, body));
  }),
);

organizationRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const body = updateOrganizationSchema.parse(req.body);
    const { organizationId, ...data } = body;
    res.json(
      await organizationService.updateOrganization(req, {
        organizationId,
        data,
      }),
    );
  }),
);

organizationRouter.get(
  "/members",
  asyncHandler(async (req, res) => {
    const organizationId =
      typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
    res.json(await organizationService.listMembers(req, organizationId));
  }),
);

organizationRouter.post(
  "/members/invite",
  asyncHandler(async (req, res) => {
    const body = inviteMemberSchema.parse(req.body);
    res.status(201).json(await organizationService.inviteMember(req, body));
  }),
);

organizationRouter.patch(
  "/members/role",
  asyncHandler(async (req, res) => {
    const body = updateMemberRoleSchema.parse(req.body);
    res.json(await organizationService.updateMemberRole(req, body));
  }),
);

organizationRouter.post(
  "/members/remove",
  asyncHandler(async (req, res) => {
    const body = removeMemberSchema.parse(req.body);
    res.json(await organizationService.removeMember(req, body));
  }),
);

organizationRouter.get(
  "/invitations",
  asyncHandler(async (req, res) => {
    const organizationId =
      typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
    res.json(await organizationService.listInvitations(req, organizationId));
  }),
);

organizationRouter.post(
  "/invitations/:id/cancel",
  asyncHandler(async (req, res) => {
    const invitationId = z.string().parse(req.params.id);
    res.json(await organizationService.cancelInvitation(req, invitationId));
  }),
);

organizationRouter.post(
  "/invitations/:id/accept",
  asyncHandler(async (req, res) => {
    const invitationId = z.string().parse(req.params.id);
    res.json(
      await auth.api.acceptInvitation({
        headers: fromNodeHeaders(req.headers),
        body: { invitationId },
      }),
    );
  }),
);

organizationRouter.get(
  "/roles",
  asyncHandler(async (req, res) => {
    const organizationId =
      typeof req.query.organizationId === "string" ? req.query.organizationId : undefined;
    res.json(await organizationService.listOrgRoles(req, organizationId));
  }),
);

organizationRouter.get(
  "/roles/detail",
  asyncHandler(async (req, res) => {
    const query = getOrgRoleQuerySchema.parse(req.query);
    res.json(await organizationService.getOrgRole(req, query));
  }),
);

organizationRouter.post(
  "/roles",
  asyncHandler(async (req, res) => {
    const body = createOrgRoleSchema.parse(req.body);
    res.status(201).json(await organizationService.createOrgRole(req, body));
  }),
);

organizationRouter.patch(
  "/roles",
  asyncHandler(async (req, res) => {
    const body = updateOrgRoleSchema.parse(req.body);
    res.json(await organizationService.updateOrgRole(req, body));
  }),
);

organizationRouter.post(
  "/roles/delete",
  asyncHandler(async (req, res) => {
    const body = deleteOrgRoleSchema.parse(req.body);
    res.json(await organizationService.deleteOrgRole(req, body));
  }),
);

organizationRouter.get(
  "/permissions",
  asyncHandler(async (req, res) => {
    const query = getMemberPermissionsQuerySchema.parse(req.query);
    res.json(await organizationService.getMemberPermissions(req, query.organizationId));
  }),
);

organizationRouter.post(
  "/permissions/check",
  asyncHandler(async (req, res) => {
    const body = hasPermissionSchema.parse(req.body);
    res.json(await organizationService.hasOrganizationPermission(req, body));
  }),
);

organizationRouter.use("/teams", teamsRouter);
