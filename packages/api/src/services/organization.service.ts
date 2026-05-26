import { auth } from "@hesapport-api/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

function sessionHeaders(req: Request) {
  return fromNodeHeaders(req.headers);
}

export async function listOrganizations(req: Request) {
  return auth.api.listOrganizations({
    headers: sessionHeaders(req),
  });
}

export async function getActiveOrganization(req: Request) {
  return auth.api.getFullOrganization({
    headers: sessionHeaders(req),
    query: {},
  });
}

export async function getOrganization(req: Request, organizationId?: string) {
  return auth.api.getFullOrganization({
    headers: sessionHeaders(req),
    query: organizationId ? { organizationId } : {},
  });
}

export async function setActiveOrganization(
  req: Request,
  input: { organizationId?: string | null; organizationSlug?: string },
) {
  return auth.api.setActiveOrganization({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function updateOrganization(
  req: Request,
  input: {
    data: { name?: string; slug?: string; logo?: string; metadata?: Record<string, unknown> };
    organizationId?: string;
  },
) {
  return auth.api.updateOrganization({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function listMembers(req: Request, organizationId?: string) {
  return auth.api.listMembers({
    headers: sessionHeaders(req),
    query: organizationId ? { organizationId } : {},
  });
}

export async function inviteMember(
  req: Request,
  input: {
    email: string;
    role: string | string[];
    organizationId?: string;
    teamId?: string;
    resend?: boolean;
  },
) {
  return auth.api.createInvitation({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function listInvitations(req: Request, organizationId?: string) {
  return auth.api.listInvitations({
    headers: sessionHeaders(req),
    query: organizationId ? { organizationId } : {},
  });
}

export async function cancelInvitation(req: Request, invitationId: string) {
  return auth.api.cancelInvitation({
    headers: sessionHeaders(req),
    body: { invitationId },
  });
}

export async function updateMemberRole(
  req: Request,
  input: { memberId: string; role: string | string[]; organizationId?: string },
) {
  return auth.api.updateMemberRole({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function removeMember(
  req: Request,
  input: { memberIdOrEmail: string; organizationId?: string },
) {
  return auth.api.removeMember({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function getActiveMember(req: Request) {
  return auth.api.getActiveMember({
    headers: sessionHeaders(req),
  });
}

export async function listOrgRoles(req: Request, organizationId?: string) {
  return auth.api.listOrgRoles({
    headers: sessionHeaders(req),
    query: organizationId ? { organizationId } : {},
  });
}

export async function getOrgRole(
  req: Request,
  query: { roleName?: string; roleId?: string; organizationId?: string },
) {
  return auth.api.getOrgRole({
    headers: sessionHeaders(req),
    query,
  });
}

export async function createOrgRole(
  req: Request,
  input: {
    role: string;
    permission: Record<string, string[]>;
    organizationId?: string;
  },
) {
  return auth.api.createOrgRole({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function updateOrgRole(
  req: Request,
  input: {
    roleName?: string;
    roleId?: string;
    organizationId?: string;
    data: {
      roleName?: string;
      permission?: Record<string, string[]>;
    };
  },
) {
  return auth.api.updateOrgRole({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function deleteOrgRole(
  req: Request,
  input: { roleName?: string; roleId?: string; organizationId?: string },
) {
  return auth.api.deleteOrgRole({
    headers: sessionHeaders(req),
    body: input,
  });
}

export async function hasOrganizationPermission(
  req: Request,
  input: { permissions: Record<string, string[]>; organizationId?: string },
) {
  return auth.api.hasPermission({
    headers: sessionHeaders(req),
    body: input,
  });
}

/** GET /organization/list-teams */
export async function listTeams(req: Request, organizationId?: string) {
  return auth.api.listOrganizationTeams({
    headers: sessionHeaders(req),
    query: organizationId ? { organizationId } : {},
  });
}

/** GET /organization/list-user-teams */
export async function listUserTeams(req: Request) {
  return auth.api.listUserTeams({
    headers: sessionHeaders(req),
  });
}

/** POST /organization/create-team */
export async function createTeam(
  req: Request,
  input: { name: string; organizationId?: string },
) {
  return auth.api.createTeam({
    headers: sessionHeaders(req),
    body: input,
  });
}

/** POST /organization/update-team */
export async function updateTeam(
  req: Request,
  input: {
    teamId: string;
    organizationId?: string;
    data: { name?: string };
  },
) {
  return auth.api.updateTeam({
    headers: sessionHeaders(req),
    body: input,
  });
}

/** POST /organization/remove-team */
export async function removeTeam(
  req: Request,
  input: { teamId: string; organizationId?: string },
) {
  return auth.api.removeTeam({
    headers: sessionHeaders(req),
    body: input,
  });
}

/** POST /organization/set-active-team */
export async function setActiveTeam(req: Request, teamId: string | null) {
  return auth.api.setActiveTeam({
    headers: sessionHeaders(req),
    body: { teamId },
  });
}

/** POST /organization/list-team-members */
export async function listTeamMembers(req: Request, teamId?: string) {
  return auth.api.listTeamMembers({
    headers: sessionHeaders(req),
    query: teamId ? { teamId } : {},
  });
}

/** POST /organization/add-team-member */
export async function addTeamMember(
  req: Request,
  input: { teamId: string; userId: string },
) {
  return auth.api.addTeamMember({
    headers: sessionHeaders(req),
    body: input,
  });
}

/** POST /organization/remove-team-member */
export async function removeTeamMember(
  req: Request,
  input: { teamId: string; userId: string },
) {
  return auth.api.removeTeamMember({
    headers: sessionHeaders(req),
    body: input,
  });
}
