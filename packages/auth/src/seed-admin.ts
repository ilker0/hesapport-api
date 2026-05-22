import { eq } from "drizzle-orm";

import { db } from "@hesapport-api/db";
import { user } from "@hesapport-api/db/schema/auth";
import { seedRbacDefaults } from "@hesapport-api/db/seed/rbac";
import { env } from "@hesapport-api/env/server";

import { auth } from "./index";
import { assignRoleToUserByName, userHasRole } from "./rbac";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@hesapport.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "HesapportAdmin1!";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "System Admin";

async function seedAdmin() {
  await seedRbacDefaults();

  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  let userId = existing?.id;

  if (!existing) {
    const response = await auth.handler(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          name: ADMIN_NAME,
        }),
      }),
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to create admin user (${response.status}): ${body}`);
    }

    const [created] = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL)).limit(1);
    userId = created?.id;
    console.log(`Created user: ${ADMIN_EMAIL}`);
  }

  if (!userId) {
    throw new Error(`User not found after sign-up: ${ADMIN_EMAIL}`);
  }

  if (await userHasRole(userId, "admin")) {
    console.log(`Admin user already has admin role: ${ADMIN_EMAIL}`);
    return;
  }

  await assignRoleToUserByName(userId, "admin");
  console.log(`Assigned admin role (all DB permissions) to: ${ADMIN_EMAIL}`);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
