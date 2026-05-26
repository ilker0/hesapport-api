import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.string().default("8080"),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_API_KEY: z.string().min(1),
    /** Better Auth Infrastructure (dash analytics). */
    BETTER_AUTH_API_URL: z.url().optional(),
    /** Resend — https://resend.com/docs/introduction */
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().min(3).default("Hesapport <onboarding@resend.dev>"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    APP_NAME: z.string().min(1).default("Hesapport"),
    /** Dev ortamında Resend ile gerçek gönderim (RESEND_API_KEY gerekir). */
    EMAIL_SEND_IN_DEV: z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true"),
    CORS_ORIGIN: z.url(),
    ADMIN_CORS_ORIGIN: z.url().optional(),
    /** Max accounts per browser/device (Better Auth multi-session plugin). */
    MULTI_SESSION_MAXIMUM_SESSIONS: z.coerce.number().int().positive().default(10),
    ORG_MAXIMUM_TEAMS: z.coerce.number().int().positive().default(10),
    ORG_ALLOW_REMOVING_ALL_TEAMS: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    ORG_DEFAULT_TEAM_NAME: z.string().min(1).default("Ana Şube"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
