import { createDb } from "@hesapport-api/db";
import * as authSchema from "@hesapport-api/db/schema/auth";
import * as organizationSchema from "@hesapport-api/db/schema/organization";
import { env } from "@hesapport-api/env/server";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createAdminPlugin } from "./admin";
import {
  createOrganizationPlugin,
  getPrimaryOrganizationId,
  provisionUserOrganization,
} from "./organization";

const schema = { ...authSchema, ...organizationSchema };

export { userIsAppAdmin, parseUserRoles } from "./app-admin";
export { createAdminPlugin, seedPlatformAdmin, adminRole, userRole } from "./admin";
export { ensureCredentialPassword } from "./ensure-credential";
export { getAuthErrorMessage, signInEmailWithResponse } from "./sign-in-email";
export {
  buildOrganizationName,
  buildOrganizationSlug,
  getPrimaryOrganizationId,
  provisionUserOrganization,
  userHasOrganization,
} from "./organization";

const isProduction = env.NODE_ENV === "production";

function getTrustedOrigins() {
  const origins = new Set<string>([env.CORS_ORIGIN, env.BETTER_AUTH_URL]);
  if (env.ADMIN_CORS_ORIGIN) {
    origins.add(env.ADMIN_CORS_ORIGIN);
  }
  return [...origins];
}

export function createAuth() {
  const db = createDb();

  const authInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    trustedOrigins: getTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        httpOnly: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await provisionUserOrganization(authInstance, user);
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const activeOrganizationId = await getPrimaryOrganizationId(session.userId);
            return {
              data: {
                ...session,
                activeOrganizationId,
              },
            };
          },
        },
      },
    },
    plugins: [
      createAdminPlugin(),
      createOrganizationPlugin(),
      dash({
        apiKey: env.BETTER_AUTH_API_KEY,
      }),
    ],
  });

  return authInstance;
}

export const auth = createAuth();
