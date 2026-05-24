import { db } from "@hesapport-api/db";
import { account } from "@hesapport-api/db/schema/auth";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";

export async function ensureCredentialPassword(userId: string, password: string) {
  const [credential] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
    .limit(1);

  const hashed = await hashPassword(password);

  if (credential) {
    await db.update(account).set({ password: hashed }).where(eq(account.id, credential.id));
    return;
  }

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId,
    accountId: userId,
    providerId: "credential",
    password: hashed,
  });
}
