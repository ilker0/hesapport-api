import { auth } from "@hesapport-api/auth";
import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/async-handler";
import { requireAuth } from "../middleware/require-auth";
import {
  inviteMemberSchema,
  removeMemberSchema,
  setActiveOrganizationSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "../schemas/organization.schema";
import * as organizationService from "../services/organization.service";

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
