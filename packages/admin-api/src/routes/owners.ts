import { asyncHandler } from "@hesapport-api/api/lib/async-handler";
import { withAuth } from "@hesapport-api/api/lib/auth-handler";
import { parseIdParam } from "@hesapport-api/api/lib/session";
import { Router } from "express";

import { attachSession } from "../middleware/session";
import { requireAdmin } from "../middleware/require-admin";
import { createOwnerSchema } from "../schemas/owner.schema";
import * as ownersService from "../services/owners.service";

export const adminOwnersRouter = Router();

adminOwnersRouter.use(attachSession, requireAdmin);

adminOwnersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await ownersService.listOwners());
  }),
);

adminOwnersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createOwnerSchema.parse(req.body);
    const result = await withAuth(() => ownersService.createOwner(body));
    res.status(201).json(result);
  }),
);

adminOwnersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await withAuth(() => ownersService.getOwner(parseIdParam(req.params.id))));
  }),
);
