import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string().default("8080"),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("7d"),
    /** Resend — https://resend.com/docs/introduction */
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().min(3).default("Hesapport <onboarding@resend.dev>"),
    APP_NAME: z.string().min(1).default("Hesapport"),
    APP_ORIGIN: z.url(),
    API_PUBLIC_URL: z.url().optional(),
    EMAIL_SEND_IN_DEV: z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true"),
    CORS_ORIGIN: z.url(),
    EMAIL_VERIFICATION_CALLBACK_URL: z.url().optional(),
    ADMIN_CORS_ORIGIN: z.url().optional(),
    ORG_MAXIMUM_BRANCHES: z.coerce.number().int().positive().default(50),
    ORG_DEFAULT_BRANCH_NAME: z.string().min(1).default("Ana Şube"),
    AUTH_TOKEN_EXPIRES_HOURS: z.coerce.number().int().positive().default(24),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export function getApiPublicUrl() {
  return env.API_PUBLIC_URL ?? env.APP_ORIGIN;
}
