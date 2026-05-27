import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organization } from "./organization";

export const owner = pgTable(
  "owner",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    businessName: text("business_name"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("owner_email_idx").on(table.email)],
);

export const ownerRelations = relations(owner, ({ many }) => ({
  organizations: many(organization),
}));
