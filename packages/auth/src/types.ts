export type PrincipalType = "admin" | "owner" | "org_user";

export type AdminSession = {
  type: "admin";
  sub: string;
  email: string;
  name: string;
};

export type OwnerSession = {
  type: "owner";
  sub: string;
  email: string;
  name: string;
  organizationId: string;
};

export type OrgUserSession = {
  type: "org_user";
  sub: string;
  username: string;
  displayName: string;
  organizationId: string;
  branchId: string;
  roleId: string;
};

export type SessionPayload = AdminSession | OwnerSession | OrgUserSession;

export type PermissionMap = Record<string, string[]>;
