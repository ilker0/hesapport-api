import { auth, provisionUserOrganization } from "@hesapport-api/auth";
import { db } from "@hesapport-api/db";
import { user } from "@hesapport-api/db/schema/auth";
import { HttpError } from "@hesapport-api/api/lib/http-error";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import type { z } from "zod";

import { queryFromRequest, sessionHeaders } from "../lib/session-headers";
import type { createUserSchema } from "../schemas/user.schema";

export type CreateUserInput = z.infer<typeof createUserSchema>;

export async function listUsers(req: Request) {
  return auth.api.listUsers({
    headers: sessionHeaders(req),
    query: queryFromRequest(req.query),
  });
}

export async function getUser(req: Request, userId: string) {
  return auth.api.getUser({
    headers: sessionHeaders(req),
    query: { id: userId },
  });
}

export async function getUserDetail(userId: string) {
  const [authUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!authUser) {
    throw new HttpError(404, "User not found");
  }

  return { user: authUser };
}

export async function createUser(req: Request, input: CreateUserInput) {
  const { role, ...body } = input;

  const result = await auth.api.createUser({
    headers: sessionHeaders(req),
    body: {
      ...body,
      role: role ?? "user",
    },
  });

  if (result.user?.id) {
    const [createdUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, result.user.id))
      .limit(1);

    if (createdUser) {
      await provisionUserOrganization(auth, createdUser);
    }
  }

  return result;
}

export async function banUser(
  req: Request,
  userId: string,
  body: { banReason?: string; banExpiresIn?: number },
) {
  return auth.api.banUser({
    headers: sessionHeaders(req),
    body: {
      userId,
      ...body,
    },
  });
}

export async function unbanUser(req: Request, userId: string) {
  return auth.api.unbanUser({
    headers: sessionHeaders(req),
    body: { userId },
  });
}

export async function removeUser(req: Request, userId: string) {
  return auth.api.removeUser({
    headers: sessionHeaders(req),
    body: { userId },
  });
}

export async function setUserRole(req: Request, userId: string, role: "user" | "admin") {
  return auth.api.setRole({
    headers: sessionHeaders(req),
    body: { userId, role },
  });
}
