import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Organization access control — required for dynamic roles.
 * @see https://better-auth.com/docs/plugins/organization#dynamic-access-control
 */
const statement = {
  ...defaultStatements,
} as const;

export const organizationAccessControl = createAccessControl(statement);

export const organizationOwnerRole = organizationAccessControl.newRole(ownerAc.statements);
export const organizationAdminRole = organizationAccessControl.newRole(adminAc.statements);
export const organizationMemberRole = organizationAccessControl.newRole(memberAc.statements);

export const organizationRoles = {
  owner: organizationOwnerRole,
  admin: organizationAdminRole,
  member: organizationMemberRole,
};
