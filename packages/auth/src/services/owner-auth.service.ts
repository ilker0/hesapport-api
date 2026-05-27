import { db } from "@hesapport-api/db";
import { owner } from "@hesapport-api/db/schema/owner";
import { organization } from "@hesapport-api/db/schema/organization";
import { eq } from "drizzle-orm";

import { sendPasswordResetEmail, sendVerificationEmail } from "../email";
import { AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAccessToken } from "../lib/jwt";
import { createOrganizationForOwner } from "./organization-setup.service";
import { buildSessionExpiresAt, createAuthSession } from "./session.service";
import { consumeAuthToken, createAuthToken } from "./token.service";
import type { OwnerSession } from "../types";
import { env } from "@hesapport-api/env/server";

async function getOwnerByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [row] = await db.select().from(owner).where(eq(owner.email, normalized)).limit(1);
  return row ?? null;
}

async function getOwnerById(id: string) {
  const [row] = await db.select().from(owner).where(eq(owner.id, id)).limit(1);
  return row ?? null;
}

async function getOwnerOrganization(ownerId: string) {
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.ownerId, ownerId))
    .limit(1);
  return org ?? null;
}

async function toSession(row: typeof owner.$inferSelect): Promise<OwnerSession> {
  const org = await getOwnerOrganization(row.id);
  if (!org) throw AuthErrors.notFound("Organization");
  return {
    type: "owner",
    sub: row.id,
    sessionId: "",
    email: row.email,
    name: row.name,
    organizationId: org.id,
  };
}

async function sendVerificationIfNeeded(row: typeof owner.$inferSelect) {
  const raw = await createAuthToken({
    type: "email_verify",
    principalType: "owner",
    principalId: row.id,
  });
  sendVerificationEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "owner" });
}

export async function ownerSignUp(input: {
  email: string;
  password: string;
  name: string;
  businessName?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (await getOwnerByEmail(email)) throw AuthErrors.emailTaken();

  const id = newId();
  const passwordHash = await hashPassword(input.password);

  const [row] = await db
    .insert(owner)
    .values({
      id,
      email,
      passwordHash,
      name: input.name,
      businessName: input.businessName ?? null,
      emailVerified: false,
    })
    .returning();

  if (!row) throw new Error("Failed to create owner");

  await createOrganizationForOwner({
    ownerId: row.id,
    name: row.name,
    businessName: row.businessName,
  });

  await sendVerificationIfNeeded(row);

  return {
    user: row,
    emailVerificationSent: true,
  };
}

export async function ownerSignIn(
  input: { email: string; password: string },
  meta?: { ipAddress?: string; userAgent?: string },
) {
  const row = await getOwnerByEmail(input.email);
  if (!row || !(await verifyPassword(input.password, row.passwordHash))) {
    throw AuthErrors.invalidCredentials();
  }

  if (!row.emailVerified) {
    await sendVerificationIfNeeded(row);
    throw AuthErrors.emailNotVerified();
  }

  const baseSession = await toSession(row);
  const persisted = await createAuthSession({
    principalType: "owner",
    principalId: row.id,
    organizationId: baseSession.organizationId,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    expiresAt: buildSessionExpiresAt(env.JWT_EXPIRES_IN),
  });
  const session = { ...baseSession, sessionId: persisted.id };
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row, session, persistedSession: persisted };
}

export async function ownerVerifyEmail(rawToken: string) {
  const token = await consumeAuthToken({
    raw: rawToken,
    type: "email_verify",
    principalType: "owner",
  });
  await db.update(owner).set({ emailVerified: true }).where(eq(owner.id, token.principalId));
  const row = await getOwnerById(token.principalId);
  if (!row) throw AuthErrors.notFound("Owner");
  const baseSession = await toSession(row);
  const persisted = await createAuthSession({
    principalType: "owner",
    principalId: row.id,
    organizationId: baseSession.organizationId,
    expiresAt: buildSessionExpiresAt(env.JWT_EXPIRES_IN),
  });
  const session = { ...baseSession, sessionId: persisted.id };
  const accessToken = await signAccessToken(session);
  return { accessToken, user: row };
}

export async function ownerResendVerification(email: string) {
  const row = await getOwnerByEmail(email);
  if (!row || row.emailVerified) return;
  await sendVerificationIfNeeded(row);
}

export async function ownerForgotPassword(email: string) {
  const row = await getOwnerByEmail(email);
  if (!row) return;
  const raw = await createAuthToken({
    type: "password_reset",
    principalType: "owner",
    principalId: row.id,
  });
  sendPasswordResetEmail({ to: row.email, userName: row.name, rawToken: raw, principal: "owner" });
}

export async function ownerResetPassword(input: { token: string; password: string }) {
  const token = await consumeAuthToken({
    raw: input.token,
    type: "password_reset",
    principalType: "owner",
  });
  const passwordHash = await hashPassword(input.password);
  await db.update(owner).set({ passwordHash }).where(eq(owner.id, token.principalId));
}

export async function getOwnerProfile(ownerId: string) {
  const row = await getOwnerById(ownerId);
  if (!row) throw AuthErrors.notFound("Owner");
  const org = await getOwnerOrganization(ownerId);
  return { owner: row, organization: org };
}
