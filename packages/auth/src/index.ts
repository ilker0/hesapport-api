import { createDb } from "@hesapport-api/db";
import * as authSchema from "@hesapport-api/db/schema/auth";
import * as organizationSchema from "@hesapport-api/db/schema/organization";
import { env } from "@hesapport-api/env/server";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { createAdminPlugin } from "./admin";
import {
  sendChangeEmailConfirmation as dispatchChangeEmailConfirmation,
  sendPasswordResetEmail as dispatchPasswordResetEmail,
  sendVerificationEmail as dispatchVerificationEmail,
} from "./email";
import { createMultiSessionPlugin } from "./multi-session";
import {
  createOrganizationPlugin,
  getPrimaryOrganizationId,
  provisionUserOrganization,
} from "./organization";
import { authUserAdditionalFields } from "./user-fields";

const schema = { ...authSchema, ...organizationSchema };

export { userIsAppAdmin, parseUserRoles } from "./app-admin";
export { createAdminPlugin, seedPlatformAdmin, adminRole, userRole } from "./admin";
export { createMultiSessionPlugin } from "./multi-session";
export { authUserAdditionalFields } from "./user-fields";
export { ensureCredentialPassword } from "./ensure-credential";
export { getAuthErrorMessage, signInEmailWithResponse } from "./sign-in-email";
export {
  buildOrganizationName,
  buildOrganizationSlug,
  getPrimaryOrganizationId,
  organizationAccessControl,
  organizationCreatorRole,
  organizationRoles,
  provisionUserOrganization,
  resolveOrganizationMemberPermissions,
  userHasOrganization,
} from "./organization";
export type { OrganizationPermissionMap } from "./organization";

const isProduction = env.NODE_ENV === "production";

function getTrustedOrigins() {
  const origins = new Set<string>([env.CORS_ORIGIN, env.BETTER_AUTH_URL]);
  if (env.ADMIN_CORS_ORIGIN) {
    origins.add(env.ADMIN_CORS_ORIGIN);
  }
  if (env.NODE_ENV !== "production") {
    origins.add("http://localhost:5173");
    origins.add("http://localhost:5174");
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
      autoSignIn: false,
      requireEmailVerification: true,
      async sendResetPassword({ user, url }) {
        dispatchPasswordResetEmail({
          to: user.email,
          resetLink: url,
          userName: user.name,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: false,
      async sendVerificationEmail({ user, url }) {
        dispatchVerificationEmail({
          to: user.email,
          verificationUrl: url,
          userName: user.name,
        });
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    user: {
      additionalFields: authUserAdditionalFields,
      changeEmail: {
        enabled: true,
        async sendChangeEmailConfirmation({ user, newEmail, url }) {
          dispatchChangeEmailConfirmation({
            to: newEmail,
            confirmationLink: url,
            newEmail,
            currentEmail: user.email,
            userName: user.name,
          });
        },
      },
    },
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
      createMultiSessionPlugin(),
      dash({
        apiKey: env.BETTER_AUTH_API_KEY,
      }),
    ],
  });

  return authInstance;
}

export const auth = createAuth();
