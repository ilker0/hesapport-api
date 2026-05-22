import { db } from "@hesapport-api/db";
import { permission } from "@hesapport-api/db/schema/rbac";
import { asc } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/session";

export const adminPermissionsRouter = Router();

adminPermissionsRouter.use(requireAdmin);

adminPermissionsRouter.get("/", async (_req, res) => {
  const permissions = await db
    .select()
    .from(permission)
    .orderBy(asc(permission.resource), asc(permission.action));
  res.json({ permissions });
});

const createPermissionSchema = z.object({
  resource: z.string().min(1),
  action: z.string().min(1),
  description: z.string().optional(),
});

adminPermissionsRouter.post("/", async (req, res) => {
  const parsed = createPermissionSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const [created] = await db.insert(permission).values(parsed.data).returning();

  res.status(201).json({ permission: created });
});
