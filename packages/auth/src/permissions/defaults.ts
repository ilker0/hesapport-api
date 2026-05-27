import type { PermissionMap } from "../types";

export const PERMISSION_RESOURCES = [
  "organization",
  "branch",
  "org_user",
  "role",
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const ALL_ACTIONS = ["create", "read", "update", "delete"] as const;

export const ownerPermissions: PermissionMap = {
  organization: ["read", "update"],
  branch: ["create", "read", "update", "delete"],
  org_user: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
};

export const adminRolePermissions: PermissionMap = {
  organization: ["read", "update"],
  branch: ["create", "read", "update", "delete"],
  org_user: ["create", "read", "update", "delete"],
  role: ["read"],
};

export const memberRolePermissions: PermissionMap = {
  organization: ["read"],
  branch: ["read"],
  org_user: ["read"],
  role: ["read"],
};

export const SYSTEM_ROLE_NAMES = {
  owner: "owner",
  admin: "admin",
  member: "member",
} as const;

export function hasPermission(
  permissions: PermissionMap,
  resource: string,
  action: string,
): boolean {
  const actions = permissions[resource];
  return Array.isArray(actions) && actions.includes(action);
}

export function mergePermissions(...maps: PermissionMap[]): PermissionMap {
  const merged: PermissionMap = {};
  for (const map of maps) {
    for (const [resource, actions] of Object.entries(map)) {
      merged[resource] = [...new Set([...(merged[resource] ?? []), ...actions])];
    }
  }
  return merged;
}
