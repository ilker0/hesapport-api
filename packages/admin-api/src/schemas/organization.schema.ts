import { z } from "zod";

export const organizationIdParamSchema = z.string().min(1);

export const createOrganizationSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  userId: z.string().min(1),
  logo: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  logo: z.string().url().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const checkOrganizationSlugSchema = z.object({
  slug: z.string().min(2),
});
