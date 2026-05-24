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
    role: "member" | "admin" | "owner";
    organizationId?: string;
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
  input: { memberId: string; role: "member" | "admin" | "owner"; organizationId?: string },
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
