import { z } from "zod";

export const ownerSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  businessName: z.string().min(1).optional(),
});

export const ownerSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const orgUserSignInSchema = z.object({
  organizationSlug: z.string().min(2),
  username: z.string().min(2),
  password: z.string().min(1),
});

export const emailOnlySchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
