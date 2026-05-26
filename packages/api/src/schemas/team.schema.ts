import { z } from "zod";

/** Matches Better Auth list-teams / create-team query & body. */
export const organizationIdQuerySchema = z.object({
  organizationId: z.string().optional(),
});

export const createTeamSchema = z.object({
  name: z.string().min(1),
  organizationId: z.string().optional(),
});

export const updateTeamSchema = z.object({
  teamId: z.string().min(1),
  organizationId: z.string().optional(),
  data: z.object({
    name: z.string().min(1).optional(),
  }),
});

export const removeTeamSchema = z.object({
  teamId: z.string().min(1),
  organizationId: z.string().optional(),
});

export const setActiveTeamSchema = z.object({
  teamId: z.string().nullable(),
});

export const listTeamMembersQuerySchema = z.object({
  teamId: z.string().optional(),
});

export const addTeamMemberSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
});

export const removeTeamMemberSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
});
