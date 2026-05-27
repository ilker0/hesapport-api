import { db } from "@hesapport-api/db";
import { owner } from "@hesapport-api/db/schema/owner";
import { organization } from "@hesapport-api/db/schema/organization";
import {
  AuthErrors,
  createOrganizationForOwner,
  hashPassword,
  newId,
} from "@hesapport-api/auth";
import { eq } from "drizzle-orm";

export async function listOwners() {
  return db
    .select({
      owner,
      organization,
    })
    .from(owner)
    .leftJoin(organization, eq(organization.ownerId, owner.id));
}

export async function createOwner(input: {
  email: string;
  password: string;
  name: string;
  businessName?: string;
  emailVerified?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select().from(owner).where(eq(owner.email, email)).limit(1);
  if (existing) throw AuthErrors.emailTaken();

  const id = newId();
  const passwordHash = await hashPassword(input.password);

  const [row] = await db
    .insert(owner)
    .values({
      id,
      email,
      passwordHash,
      name: input.name,
      businessName: input.businessName ?? null,
      emailVerified: input.emailVerified ?? true,
    })
    .returning();

  if (!row) throw new Error("Failed to create owner");

  const org = await createOrganizationForOwner({
    ownerId: row.id,
    name: row.name,
    businessName: row.businessName,
  });

  return { owner: row, organizationId: org.organizationId, slug: org.slug };
}

export async function getOwner(ownerId: string) {
  const [row] = await db.select().from(owner).where(eq(owner.id, ownerId)).limit(1);
  if (!row) throw AuthErrors.notFound("Owner");
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.ownerId, ownerId))
    .limit(1);
  return { owner: row, organization: org ?? null };
}
