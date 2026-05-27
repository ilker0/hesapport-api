import { env } from "@hesapport-api/env/server";

import { seedDefaultAdmin } from "./services/admin-auth.service";

const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;
const name = env.ADMIN_NAME ?? "System Admin";

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  process.exit(1);
}

const result = await seedDefaultAdmin({ email, password, name });
console.error(`Admin seed: userId=${result.userId} created=${result.created}`);
