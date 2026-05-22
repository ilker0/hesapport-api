import { db } from "@hesapport-api/db";
import { permission, role, rolePermission } from "@hesapport-api/db/schema/rbac";
import { and, asc, eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { requireAdmin } from "../lib/session";

export const adminRolesRouter = Router();

adminRolesRouter.use(requireAdmin);

adminRolesRouter.get("/", async (_req, res) => {
  const roles = await db.select().from(role).orderBy(asc(role.name));
  res.json({ roles });
});

adminRolesRouter.get("/:id", async (req, res) => {
  const [roleRow] = await db.select().from(role).where(eq(role.id, req.params.id)).limit(1);

  if (!roleRow) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  const permissions = await db
    .select({
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    })
    .from(rolePermission)
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(eq(rolePermission.roleId, roleRow.id));

  res.json({ role: roleRow, permissions });
});

const createRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/),
  displayName: z.string().min(1),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

adminRolesRouter.post("/", async (req, res) => {
  const parsed = createRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const [created] = await db
    .insert(role)
    .values({
      name: parsed.data.name,
      displayName: parsed.data.displayName,
      description: parsed.data.description,
      isSystem: false,
    })
    .returning();

  if (created && parsed.data.permissionIds?.length) {
    await db.insert(rolePermission).values(
      parsed.data.permissionIds.map((permissionId) => ({
        roleId: created.id,
        permissionId,
      })),
    );
  }

  res.status(201).json({ role: created });
});

const updateRoleSchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().optional(),
});

adminRolesRouter.patch("/:id", async (req, res) => {
  const parsed = updateRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const [updated] = await db
    .update(role)
    .set(parsed.data)
    .where(eq(role.id, req.params.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  res.json({ role: updated });
});

const setPermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

adminRolesRouter.put("/:id/permissions", async (req, res) => {
  const parsed = setPermissionsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const [roleRow] = await db.select().from(role).where(eq(role.id, req.params.id)).limit(1);

  if (!roleRow) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  await db.delete(rolePermission).where(eq(rolePermission.roleId, roleRow.id));

  if (parsed.data.permissionIds.length > 0) {
    await db.insert(rolePermission).values(
      parsed.data.permissionIds.map((permissionId) => ({
        roleId: roleRow.id,
        permissionId,
      })),
    );
  }

  res.json({ roleId: roleRow.id, permissionIds: parsed.data.permissionIds });
});

adminRolesRouter.delete("/:id", async (req, res) => {
  const [roleRow] = await db.select().from(role).where(eq(role.id, req.params.id)).limit(1);

  if (!roleRow) {
    res.status(404).json({ error: "Role not found" });
    return;
  }

  if (roleRow.isSystem) {
    res.status(400).json({ error: "System roles cannot be deleted" });
    return;
  }

  await db.delete(role).where(and(eq(role.id, req.params.id), eq(role.isSystem, false)));

  res.status(204).send();
});
