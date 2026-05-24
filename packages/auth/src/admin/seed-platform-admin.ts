import { and, eq } from "drizzle-orm";

import { db } from "@hesapport-api/db";
import { account, user } from "@hesapport-api/db/schema/auth";

import { userIsAppAdmin } from "../app-admin";
import { ensureCredentialPassword } from "../ensure-credential";
import { provisionUserOrganization, userHasOrganization } from "../organization";
import type { createAuth } from "../index";

export type PlatformAdminSeedConfig = {
  email: string;
  password: string;
  name: string;
};

export async function seedPlatformAdmin(
  authInstance: ReturnType<typeof createAuth>,
  config: PlatformAdminSeedConfig,
): Promise<{ userId: string; created: boolean }> {
  const email = config.email.trim().toLowerCase();

  const [existing] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  let userId = existing?.id;
  let created = false;

  if (!existing) {
    const signUp = await authInstance.api.signUpEmail({
      body: {
        email,
        password: config.password,
        name: config.name,
      },
    });

    userId = signUp.user.id;
    created = true;
  } else {
    const [credential] = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")))
      .limit(1);

    if (!credential?.password) {
      await ensureCredentialPassword(existing.id, config.password);
    }
  }

  if (!userId) {
    throw new Error(`Platform admin user could not be resolved: ${email}`);
  }

  const [row] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!row) {
    throw new Error(`Platform admin user not found after create: ${email}`);
  }

  if (!userIsAppAdmin(row)) {
    await db.update(user).set({ role: "admin" }).where(eq(user.id, userId));
  }

  const [adminUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (adminUser && !(await userHasOrganization(adminUser.id))) {
    await provisionUserOrganization(authInstance, adminUser);
  }

  return { userId, created };
}
