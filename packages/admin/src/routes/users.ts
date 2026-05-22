import { setUserRolesByName } from "@hesapport-api/auth";
import { db } from "@hesapport-api/db";
import { user } from "@hesapport-api/db/schema/auth";
import { role, userRole } from "@hesapport-api/db/schema/rbac";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { forwardAuthCookies, parseJsonResponse } from "../lib/http";
import { proxyAuthRequest } from "../lib/auth-proxy";
import { requireAdmin } from "../lib/session";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAdmin);

adminUsersRouter.get("/", async (req, res) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    }
  }
  const qs = searchParams.toString();
  const path = `/admin/list-users${qs ? `?${qs}` : ""}`;
  const response = await proxyAuthRequest(req, path, { method: "GET" });
  const data = await parseJsonResponse(response);
  forwardAuthCookies(response, res);
  res.status(response.status).json(data);
});

adminUsersRouter.get("/:id/detail", async (req, res) => {
  const userId = req.params.id;
  const [authUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!authUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const roles = await db
    .select({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId));

  res.json({ user: authUser, roles });
});

adminUsersRouter.get("/:id", async (req, res) => {
  const response = await proxyAuthRequest(req, `/admin/get-user?id=${req.params.id}`, { method: "GET" });
  const data = await parseJsonResponse(response);
  forwardAuthCookies(response, res);
  res.status(response.status).json(data);
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  roles: z.array(z.string()).optional(),
});

adminUsersRouter.post("/", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  const { roles: roleNames, ...body } = parsed.data;

  const response = await proxyAuthRequest(req, "/admin/create-user", {
    method: "POST",
    body: {
      ...body,
      role: roleNames?.[0] ?? "user",
    },
  });

  const data = await parseJsonResponse<{ user?: { id: string } }>(response);
  forwardAuthCookies(response, res);

  if (response.ok && data.user?.id && roleNames?.length) {
    await setUserRolesByName(data.user.id, roleNames);
  }

  res.status(response.status).json(data);
});

const updateRolesSchema = z.object({
  roles: z.array(z.string()).min(1),
});

adminUsersRouter.put("/:id/roles", async (req, res) => {
  const parsed = updateRolesSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }

  await setUserRolesByName(req.params.id, parsed.data.roles);

  const roles = await db
    .select({ id: role.id, name: role.name, displayName: role.displayName })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, req.params.id));

  res.json({ userId: req.params.id, roles });
});

adminUsersRouter.post("/:id/ban", async (req, res) => {
  const response = await proxyAuthRequest(req, "/admin/ban-user", {
    method: "POST",
    body: { userId: req.params.id, ...req.body },
  });
  const data = await parseJsonResponse(response);
  forwardAuthCookies(response, res);
  res.status(response.status).json(data);
});

adminUsersRouter.post("/:id/unban", async (req, res) => {
  const response = await proxyAuthRequest(req, "/admin/unban-user", {
    method: "POST",
    body: { userId: req.params.id },
  });
  const data = await parseJsonResponse(response);
  forwardAuthCookies(response, res);
  res.status(response.status).json(data);
});

adminUsersRouter.delete("/:id", async (req, res) => {
  const response = await proxyAuthRequest(req, "/admin/remove-user", {
    method: "POST",
    body: { userId: req.params.id },
  });
  const data = await parseJsonResponse(response);
  forwardAuthCookies(response, res);
  res.status(response.status).json(data);
});
