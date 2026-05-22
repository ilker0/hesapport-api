import { createDb } from "@hesapport-api/db";
import * as schema from "@hesapport-api/db/schema/auth";
import { env } from "@hesapport-api/env/server";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export type { PermissionCheck } from "./rbac";
export {
  assignRoleToUserByName,
  getUserPermissions,
  getUserRoleNames,
  setUserRolesByName,
  syncUserRoleField,
  userHasPermission,
  userHasRole,
} from "./rbac";

/** @deprecated Use PermissionCheck from dynamic RBAC */
export type Permission = import("./rbac").PermissionCheck;

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
      }),
      dash({
        apiKey: env.BETTER_AUTH_API_KEY,
      }),
    ],
  });
}

export const auth = createAuth();
