import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organization } from "./organization";

export const authSession = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    principalType: text("principal_type").$type<"admin" | "owner" | "org_user">().notNull(),
    principalId: text("principal_id").notNull(),
    organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("auth_session_principal_idx").on(table.principalType, table.principalId),
    index("auth_session_org_idx").on(table.organizationId),
    index("auth_session_expires_idx").on(table.expiresAt),
  ],
);
