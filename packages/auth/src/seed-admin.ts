import { env } from "@hesapport-api/env/server";

import { seedPlatformAdmin } from "./admin";
import { auth } from "./index";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@hesapport.local").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "HesapportAdmin1!";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "System Admin";

async function main() {
  const { userId, created } = await seedPlatformAdmin(auth, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
  });

  console.log(
    created
      ? `Created platform admin: ${ADMIN_EMAIL} (${userId})`
      : `Platform admin ready: ${ADMIN_EMAIL} (${userId})`,
  );
  console.log(`Role: admin (full Better Auth admin permissions)`);
  console.log(`Login: POST /admin/auth/login or /api/auth/sign-in/email`);
  console.log(`BETTER_AUTH_URL must match API server: ${env.BETTER_AUTH_URL}`);
  console.log(`Password: see ADMIN_PASSWORD in apps/server/.env`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
