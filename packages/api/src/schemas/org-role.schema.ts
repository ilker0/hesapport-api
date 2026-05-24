import { z } from "zod";

/** Permissions map — keys must match resources in organization access control. */
export const orgPermissionsSchema = z.record(z.string(), z.array(z.string()));

export const orgRoleNameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Role name may only contain letters, numbers, underscores, and hyphens");

/** Built-in or organization-defined dynamic role name. */
export const memberRoleSchema = z.union([
  z.enum(["owner", "admin", "member"]),
  orgRoleNameSchema,
]);

export const createOrgRoleSchema = z.object({
  role: orgRoleNameSchema,
  permission: orgPermissionsSchema,
  organizationId: z.string().optional(),
});

export const updateOrgRoleSchema = z.object({
  roleName: z.string().optional(),
  roleId: z.string().optional(),
  organizationId: z.string().optional(),
  data: z.object({
    roleName: orgRoleNameSchema.optional(),
    permission: orgPermissionsSchema.optional(),
  }),
});

export const deleteOrgRoleSchema = z
  .object({
    roleName: z.string().optional(),
    roleId: z.string().optional(),
    organizationId: z.string().optional(),
  })
  .refine((body) => body.roleName !== undefined || body.roleId !== undefined, {
    message: "Either roleName or roleId is required",
  });

export const getOrgRoleQuerySchema = z
  .object({
    roleName: z.string().optional(),
    roleId: z.string().optional(),
    organizationId: z.string().optional(),
  })
  .refine((query) => query.roleName !== undefined || query.roleId !== undefined, {
    message: "Either roleName or roleId is required",
  });

export const hasPermissionSchema = z.object({
  permissions: orgPermissionsSchema,
  organizationId: z.string().optional(),
});
