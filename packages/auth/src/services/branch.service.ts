import { db } from "@hesapport-api/db";
import { branch } from "@hesapport-api/db/schema/organization";
import { env } from "@hesapport-api/env/server";
import { and, count, eq } from "drizzle-orm";

import { AuthError, AuthErrors } from "../lib/errors";
import { newId } from "../lib/id";

export async function listBranches(organizationId: string) {
  return db.select().from(branch).where(eq(branch.organizationId, organizationId));
}

export async function createBranch(organizationId: string, name: string) {
  const [countRow] = await db
    .select({ value: count() })
    .from(branch)
    .where(eq(branch.organizationId, organizationId));

  if (Number(countRow?.value ?? 0) >= env.ORG_MAXIMUM_BRANCHES) {
    throw new AuthError("Branch limit reached", "BRANCH_LIMIT", 403);
  }

  const [row] = await db
    .insert(branch)
    .values({
      id: newId(),
      organizationId,
      name,
      isDefault: false,
    })
    .returning();

  return row;
}

export async function updateBranch(
  organizationId: string,
  branchId: string,
  data: { name?: string },
) {
  const [row] = await db
    .update(branch)
    .set(data)
    .where(and(eq(branch.id, branchId), eq(branch.organizationId, organizationId)))
    .returning();

  if (!row) throw AuthErrors.notFound("Branch");
  return row;
}

export async function deleteBranch(organizationId: string, branchId: string) {
  const [target] = await db
    .select()
    .from(branch)
    .where(and(eq(branch.id, branchId), eq(branch.organizationId, organizationId)))
    .limit(1);

  if (!target) throw AuthErrors.notFound("Branch");
  if (target.isDefault) {
    throw new AuthError("Cannot delete default branch", "DEFAULT_BRANCH", 400);
  }

  const [row] = await db.delete(branch).where(eq(branch.id, branchId)).returning();
  return row;
}
