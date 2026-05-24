import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

/** Default Better Auth admin permissions (user + session resources, full admin control). */
export const adminAccessControl = createAccessControl(defaultStatements);

export const adminRole = adminAccessControl.newRole(adminAc.statements);
export const userRole = adminAccessControl.newRole(userAc.statements);
