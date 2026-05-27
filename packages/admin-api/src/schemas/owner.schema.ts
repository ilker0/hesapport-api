import { z } from "zod";

export const createOwnerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().min(1).optional(),
  emailVerified: z.boolean().optional(),
});

export const createOrgUserAdminSchema = z.object({
  organizationId: z.string().min(1),
  branchId: z.string().min(1),
  roleIds: z.array(z.string().min(1)).min(1),
  email: z.string().email(),
  username: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8),
  displayName: z.string().min(1),
});
