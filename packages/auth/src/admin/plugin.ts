import { admin } from "better-auth/plugins";

import { adminAccessControl, adminRole, userRole } from "./access";

/**
 * Platform admin plugin — `admin` role has full user/session management permissions.
 * @see https://better-auth.com/docs/plugins/admin
 */
export function createAdminPlugin() {
  return admin({
    ac: adminAccessControl,
    roles: {
      admin: adminRole,
      user: userRole,
    },
    defaultRole: "user",
    // adminRoles: ["admin"],
    impersonationSessionDuration: 60 * 60,
  });
}
