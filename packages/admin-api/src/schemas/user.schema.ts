import { z } from "zod";

export const userIdParamSchema = z.string();

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().min(1).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const setUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});
