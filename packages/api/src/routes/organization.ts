import {
  checkOrgUserPermission,
  createBranch,
  createOrgUser,
  createOrganizationRole,
  deleteBranch,
  deleteOrgUser,
  deleteOrganizationRole,
  getOwnerProfile,
  getMergedRolePermissions,
  listBranches,
  listOrgUsers,
  listOrganizationRoles,
  ownerPermissions,
  updateBranch,
  updateOrgUser,
  updateOrganizationRole,
} from "@hesapport-api/auth";
import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import { withAuth } from "../lib/auth-handler";
import { HttpError } from "../lib/http-error";
import {
  assertOrgUserSession,
  assertOwnerSession,
  getOrganizationId,
  parseIdParam,
} from "../lib/session";
import { requireOwner, requireOwnerOrOrgUser } from "../middleware/require-auth";
import {
  createBranchSchema,
  createOrgUserSchema,
  createRoleSchema,
  updateBranchSchema,
  updateOrgUserSchema,
  updateRoleSchema,
} from "../schemas/organization.schema";

export const organizationRouter = Router();

organizationRouter.use(requireOwnerOrOrgUser);

organizationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const session = req.session!;

    if (session.type === "owner") {
      const profile = await withAuth(() => getOwnerProfile(session.sub));
      res.json(profile);
      return;
    }

    const orgUser = assertOrgUserSession(session);
    res.json({
      organizationId: orgUser.organizationId,
      branchId: orgUser.branchId,
      roleIds: orgUser.roleIds,
    });
  }),
);

organizationRouter.get(
  "/permissions",
  asyncHandler(async (req, res) => {
    const session = req.session!;

    if (session.type === "owner") {
      res.json({ permissions: ownerPermissions, role: "owner" });
      return;
    }

    const orgUser = assertOrgUserSession(session);
    const permissions = await getMergedRolePermissions(orgUser.organizationId, orgUser.roleIds);
    res.json({ permissions, roleIds: orgUser.roleIds });
  }),
);

organizationRouter.get(
  "/branches",
  asyncHandler(async (req, res) => {
    const organizationId = getOrganizationId(req.session!);
    res.json(await listBranches(organizationId));
  }),
);

organizationRouter.post(
  "/branches",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = createBranchSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() => createBranch(organizationId, body.name));
    res.status(201).json(row);
  }),
);

organizationRouter.patch(
  "/branches/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = updateBranchSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() => updateBranch(organizationId, parseIdParam(req.params.id), body));
    res.json(row);
  }),
);

organizationRouter.delete(
  "/branches/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() => deleteBranch(organizationId, parseIdParam(req.params.id)));
    res.json(row);
  }),
);

organizationRouter.get(
  "/roles",
  asyncHandler(async (req, res) => {
    res.json(await listOrganizationRoles(getOrganizationId(req.session!)));
  }),
);

organizationRouter.post(
  "/roles",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = createRoleSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      createOrganizationRole({
        organizationId,
        name: body.name,
        permissions: body.permissions,
      }),
    );
    res.status(201).json(row);
  }),
);

organizationRouter.patch(
  "/roles/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = updateRoleSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      updateOrganizationRole(organizationId, parseIdParam(req.params.id), body),
    );
    res.json(row);
  }),
);

organizationRouter.delete(
  "/roles/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      deleteOrganizationRole(organizationId, parseIdParam(req.params.id)),
    );
    res.json(row);
  }),
);

organizationRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const session = req.session!;
    const organizationId = getOrganizationId(session);

    if (session.type === "org_user") {
      const allowed = await checkOrgUserPermission({
        organizationId,
        roleIds: session.roleIds,
        resource: "org_user",
        action: "read",
      });
      if (!allowed) throw new HttpError(403, "Forbidden");
    }

    res.json(await listOrgUsers(organizationId));
  }),
);

organizationRouter.post(
  "/users",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = createOrgUserSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      createOrgUser({
        organizationId,
        ...body,
      }),
    );
    res.status(201).json(row);
  }),
);

organizationRouter.patch(
  "/users/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const body = updateOrgUserSchema.parse(req.body);
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      updateOrgUser(organizationId, parseIdParam(req.params.id), body),
    );
    res.json(row);
  }),
);

organizationRouter.delete(
  "/users/:id",
  requireOwner,
  asyncHandler(async (req, res) => {
    const organizationId = getOrganizationId(assertOwnerSession(req.session!));
    const row = await withAuth(() =>
      deleteOrgUser(organizationId, parseIdParam(req.params.id)),
    );
    res.json(row);
  }),
);
