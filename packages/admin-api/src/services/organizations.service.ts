import { auth } from "@hesapport-api/auth";
import { db } from "@hesapport-api/db";
import { member, organization } from "@hesapport-api/db/schema/organization";
import { HttpError } from "@hesapport-api/api/lib/http-error";
import { desc, eq, sql } from "drizzle-orm";
import type { Request } from "express";
import type { z } from "zod";

import { sessionHeaders } from "../lib/session-headers";
import type {
  checkOrganizationSlugSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../schemas/organization.schema";

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type CheckOrganizationSlugInput = z.infer<typeof checkOrganizationSlugSchema>;

export async function listOrganizations() {
  const rows = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      metadata: organization.metadata,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberCount: sql<number>`cast(count(${member.id}) as int)`.as("member_count"),
    })
    .from(organization)
    .leftJoin(member, eq(member.organizationId, organization.id))
    .groupBy(organization.id)
    .orderBy(desc(organization.createdAt));

  return {
    organizations: rows.map((row) => ({
      ...row,
      memberCount: Number(row.memberCount) || 0,
    })),
  };
}

export async function getOrganizationByIdFromDb(organizationId: string) {
  const [row] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (!row) {
    throw new HttpError(404, "Organization not found");
  }

  return row;
}

export async function getOrganization(req: Request, organizationId: string) {
  await getOrganizationByIdFromDb(organizationId);

  return auth.api.getFullOrganization({
    headers: sessionHeaders(req),
    query: { organizationId, membersLimit: 100 },
  });
}

export async function createOrganization(input: CreateOrganizationInput) {
  return auth.api.createOrganization({
    body: {
      name: input.name,
      slug: input.slug,
      userId: input.userId,
      logo: input.logo,
      metadata: input.metadata,
    },
  });
}

export async function updateOrganization(
  req: Request,
  organizationId: string,
  input: UpdateOrganizationInput,
) {
  await getOrganizationByIdFromDb(organizationId);

  const data: {
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: Record<string, unknown>;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.logo != null) data.logo = input.logo;
  if (input.metadata != null) data.metadata = input.metadata;

  return auth.api.updateOrganization({
    headers: sessionHeaders(req),
    body: {
      organizationId,
      data,
    },
  });
}

export async function deleteOrganization(req: Request, organizationId: string) {
  await getOrganizationByIdFromDb(organizationId);

  return auth.api.deleteOrganization({
    headers: sessionHeaders(req),
    body: { organizationId },
  });
}

export async function checkOrganizationSlug(req: Request, input: CheckOrganizationSlugInput) {
  return auth.api.checkOrganizationSlug({
    headers: sessionHeaders(req),
    body: input,
  });
}
