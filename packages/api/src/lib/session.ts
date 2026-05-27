import type { OwnerSession, OrgUserSession, SessionPayload } from "@hesapport-api/auth";

import { HttpError } from "./http-error";

export function getOrganizationId(session: SessionPayload): string {
  if (session.type === "owner" || session.type === "org_user") {
    return session.organizationId;
  }
  throw new HttpError(401, "Unauthorized");
}

export function assertOwnerSession(session: SessionPayload): OwnerSession {
  if (session.type !== "owner") throw new HttpError(403, "Owner access required");
  return session;
}

export function assertOrgUserSession(session: SessionPayload): OrgUserSession {
  if (session.type !== "org_user") throw new HttpError(403, "Org user access required");
  return session;
}

export function parseIdParam(value: string | string[] | undefined): string {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new HttpError(400, "Missing id");
  return id;
}
