import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { attachSession } from "@hesapport-api/api/middleware/session";
import { Router } from "express";

import { requireAdmin } from "../middleware/require-admin";
import {
  createUserSchema,
  setUserRoleSchema,
  userIdParamSchema,
} from "../schemas/user.schema";
import * as usersService from "../services/users.service";

export const adminUsersRouter = Router();

adminUsersRouter.use(attachSession, requireAdmin);

adminUsersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await usersService.listUsers(req));
  }),
);

adminUsersRouter.get(
  "/:id/detail",
  asyncHandler(async (req, res) => {
    const userId = userIdParamSchema.parse(req.params.id);
    res.json(await usersService.getUserDetail(userId));
  }),
);

adminUsersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = userIdParamSchema.parse(req.params.id);
    res.json(await usersService.getUser(req, id));
  }),
);

adminUsersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    const data = await usersService.createUser(req, input);
    res.status(201).json(data);
  }),
);

adminUsersRouter.put(
  "/:id/role",
  asyncHandler(async (req, res) => {
    const userId = userIdParamSchema.parse(req.params.id);
    const body = setUserRoleSchema.parse(req.body);
    res.json(await usersService.setUserRole(req, userId, body.role));
  }),
);

adminUsersRouter.post(
  "/:id/ban",
  asyncHandler(async (req, res) => {
    const userId = userIdParamSchema.parse(req.params.id);
    res.json(await usersService.banUser(req, userId, req.body ?? {}));
  }),
);

adminUsersRouter.post(
  "/:id/unban",
  asyncHandler(async (req, res) => {
    const userId = userIdParamSchema.parse(req.params.id);
    res.json(await usersService.unbanUser(req, userId));
  }),
);

adminUsersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = userIdParamSchema.parse(req.params.id);
    res.json(await usersService.removeUser(req, userId));
  }),
);
