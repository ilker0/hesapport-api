import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const authTokenType = ["email_verify", "password_reset"] as const;
export type AuthTokenType = (typeof authTokenType)[number];

export const authPrincipalType = ["admin", "owner", "org_user"] as const;
export type AuthPrincipalType = (typeof authPrincipalType)[number];

export const authToken = pgTable(
  "auth_token",
  {
    id: text("id").primaryKey(),
    type: text("type").$type<AuthTokenType>().notNull(),
    principalType: text("principal_type").$type<AuthPrincipalType>().notNull(),
    principalId: text("principal_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("auth_token_principal_idx").on(table.principalType, table.principalId),
    index("auth_token_hash_idx").on(table.tokenHash),
  ],
);
