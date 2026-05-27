export type PrincipalType = "admin" | "owner" | "org_user";

export type AdminSession = {
  type: "admin";
  sub: string;
  sessionId: string;
  email: string;
  name: string;
};

export type OwnerSession = {
  type: "owner";
  sub: string;
  sessionId: string;
  email: string;
  name: string;
  organizationId: string;
};

export type OrgUserSession = {
  type: "org_user";
  sub: string;
  sessionId: string;
  username: string;
  displayName: string;
  organizationId: string;
  branchId: string;
  roleIds: string[];
};

export type SessionPayload = AdminSession | OwnerSession | OrgUserSession;

export type PermissionMap = Record<string, string[]>;
