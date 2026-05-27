export { AuthError, AuthErrors } from "./lib/errors";
export { newId } from "./lib/id";
export { verifyAccessToken, signAccessToken } from "./lib/jwt";
export { hashPassword, verifyPassword } from "./lib/password";
export { resolveSession, extractBearerToken } from "./middleware/bearer";
export type {
  SessionPayload,
  AdminSession,
  OwnerSession,
  OrgUserSession,
  PermissionMap,
} from "./types";

export {
  PERMISSION_RESOURCES,
  ownerPermissions,
  adminRolePermissions,
  memberRolePermissions,
  SYSTEM_ROLE_NAMES,
  hasPermission,
} from "./permissions/defaults";

export * from "./services/admin-auth.service";
export * from "./services/owner-auth.service";
export * from "./services/org-user-auth.service";
export * from "./services/org-user.service";
export * from "./services/permission.service";
export * from "./services/branch.service";
export * from "./services/organization-setup.service";
export * from "./services/token.service";
export * from "./services/session.service";

export { sendVerificationEmail, sendPasswordResetEmail, isResendConfigured, APP_NAME } from "./email";
