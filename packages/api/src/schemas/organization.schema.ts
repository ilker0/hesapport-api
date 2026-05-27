import { z } from "zod";

export const orgPermissionsSchema = z.record(z.string(), z.array(z.string()));

export const createOrgUserSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid username"),
  password: z.string().min(8),
  displayName: z.string().min(1),
  roleIds: z.array(z.string().min(1)).min(1),
  branchId: z.string().min(1),
});

export const updateOrgUserSchema = z.object({
  displayName: z.string().min(1).optional(),
  roleIds: z.array(z.string().min(1)).min(1).optional(),
  branchId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export const createBranchSchema = z.object({
  name: z.string().min(1),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1),
});

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  permissions: orgPermissionsSchema,
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  permissions: orgPermissionsSchema.optional(),
});
