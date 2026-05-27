import { db } from "@hesapport-api/db";
import { adminUser } from "@hesapport-api/db/schema/admin";
import { eq } from "drizzle-orm";

import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken } from "../lib/jwt";
import { sendPasswordResetEmail, sendVerifyEmail } from "../email";
import { buildSessionExpiresAt, createAuthSession } from "./session.service";
import { createAuthToken, consumeAuthToken } from "./token.service";
import type { AdminSession } from "../types";
import { env } from "@hesapport-api/env/server";

async function getByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [row] = await db.select().from(adminUser).where(eq(adminUser.email, normalized)).limit(1);
  return row ?? null;
}

async function getById(id: string) {
  const [row] = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1);
  return row ?? null;
}

function toSession(row: typeof adminUser.$inferSelect): AdminSession {
  return {
    type: "admin",
    sub: row.id,
    sessionId: "",
    email: row.email,
    name: row.name,
  };
}

export async function adminSignIn(
  input: { email: string; password: string },
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const row = await getByEmail(input.email);
  if (!row || !(await verifyPassword(input.password, row.passwordHash))) {
    throw AuthErrors.invalidCredentials();
  }

  if (!row.emailVerified) {
    const raw = await createAuthToken({
      type: "email_verify",
      principalType: "admin",
      principalId: row.id,
    });
    sendVerifyEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "admin" });
    throw AuthErrors.emailNotVerified();
  }

  const baseSession = toSession(row);
  const persisted = await createAuthSession({
    principalType: "admin",
    principalId: row.id,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    expiresAt: buildSessionExpiresAt(env.JWT_EXPIRES_IN),
  });
  const session = { ...baseSession, sessionId: persisted.id };
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row, session, persistedSession: persisted };
}

export async function adminVerifyEmail(rawToken: string) {
  const token = await consumeAuthToken({
    raw: rawToken,
    type: "email_verify",
    principalType: "admin",
  });
  await db
    .update(adminUser)
    .set({ emailVerified: true })
    .where(eq(adminUser.id, token.principalId));
  const row = await getById(token.principalId);
  if (!row) throw AuthErrors.notFound("Admin");
  const baseSession = toSession(row);
  const persisted = await createAuthSession({
    principalType: "admin",
    principalId: row.id,
    expiresAt: buildSessionExpiresAt(env.JWT_EXPIRES_IN),
  });
  const session = { ...baseSession, sessionId: persisted.id };
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row };
}

export async function adminResendVerification(email: string) {
  const row = await getByEmail(email);
  if (!row || row.emailVerified) return;
  const raw = await createAuthToken({
    type: "email_verify",
    principalType: "admin",
    principalId: row.id,
  });
  sendVerifyEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "admin" });
}

export async function adminForgotPassword(email: string) {
  const row = await getByEmail(email);
  if (!row) return;
  const raw = await createAuthToken({
    type: "password_reset",
    principalType: "admin",
    principalId: row.id,
  });
  sendPasswordResetEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "admin" });
}

export async function adminResetPassword(input: { token: string; password: string }) {
  const token = await consumeAuthToken({
    raw: input.token,
    type: "password_reset",
    principalType: "admin",
  });
  const passwordHash = await hashPassword(input.password);
  await db
    .update(adminUser)
    .set({ passwordHash })
    .where(eq(adminUser.id, token.principalId));
}

export async function createAdminUser(input: {
  email: string;
  password: string;
  name: string;
  emailVerified?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  if (await getByEmail(email)) throw AuthErrors.emailTaken();

  const id = newId();
  const passwordHash = await hashPassword(input.password);

  const [row] = await db
    .insert(adminUser)
    .values({
      id,
      email,
      passwordHash,
      name: input.name,
      emailVerified: input.emailVerified ?? false,
    })
    .returning();

  if (!row) throw new Error("Failed to create admin");

  if (!row.emailVerified) {
    const raw = await createAuthToken({
      type: "email_verify",
      principalType: "admin",
      principalId: row.id,
    });
    sendVerifyEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "admin" });
  }

  return row;
}

export async function seedDefaultAdmin(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await getByEmail(input.email);
  if (existing) {
    if (!existing.emailVerified) {
      await db
        .update(adminUser)
        .set({ emailVerified: true })
        .where(eq(adminUser.id, existing.id));
    }
    return { userId: existing.id, created: false };
  }

  const row = await createAdminUser({
    ...input,
    emailVerified: true,
  });
  return { userId: row.id, created: true };
}
