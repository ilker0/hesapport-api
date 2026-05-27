import { z } from "zod";

export const adminSignInSchema = z.object({
  email: z.string().email(),
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
