import { z } from "zod";

import { memberRoleSchema } from "./org-role.schema";

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: memberRoleSchema.default("member"),
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
  resend: z.boolean().optional(),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.union([memberRoleSchema, z.array(memberRoleSchema)]),
  organizationId: z.string().optional(),
});

export const removeMemberSchema = z.object({
  memberIdOrEmail: z.string().min(1),
  organizationId: z.string().optional(),
});

export const setActiveOrganizationSchema = z.object({
  organizationId: z.string().nullable().optional(),
  organizationSlug: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(2).optional(),
  logo: z.string().url().optional(),
  organizationId: z.string().optional(),
});
