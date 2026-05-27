import { relations } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { owner } from "./owner";

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => owner.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("organization_owner_id_idx").on(table.ownerId),
    index("organization_slug_idx").on(table.slug),
  ],
);

export const branch = pgTable(
  "branch",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("branch_organization_id_idx").on(table.organizationId)],
);

/** Dynamic roles per organization — permissions JSON map. */
export const organizationRole = pgTable(
  "organization_role",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    permissions: jsonb("permissions").$type<Record<string, string[]>>().notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("organization_role_organization_id_idx").on(table.organizationId),
    uniqueIndex("organization_role_org_name_uidx").on(table.organizationId, table.name),
  ],
);

export const orgUser = pgTable(
  "org_user",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "restrict" }),
    roleId: text("role_id")
      .notNull()
      .references(() => organizationRole.id, { onDelete: "restrict" }),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("org_user_org_username_uidx").on(table.organizationId, table.username),
    index("org_user_organization_id_idx").on(table.organizationId),
    index("org_user_branch_id_idx").on(table.branchId),
  ],
);

export const organizationRelations = relations(organization, ({ one, many }) => ({
  owner: one(owner, {
    fields: [organization.ownerId],
    references: [owner.id],
  }),
  branches: many(branch),
  roles: many(organizationRole),
  orgUsers: many(orgUser),
}));

export const branchRelations = relations(branch, ({ one, many }) => ({
  organization: one(organization, {
    fields: [branch.organizationId],
    references: [organization.id],
  }),
  orgUsers: many(orgUser),
}));

export const organizationRoleRelations = relations(organizationRole, ({ one, many }) => ({
  organization: one(organization, {
    fields: [organizationRole.organizationId],
    references: [organization.id],
  }),
  orgUsers: many(orgUser),
}));

export const orgUserRelations = relations(orgUser, ({ one }) => ({
  organization: one(organization, {
    fields: [orgUser.organizationId],
    references: [organization.id],
  }),
  branch: one(branch, {
    fields: [orgUser.branchId],
    references: [branch.id],
  }),
  role: one(organizationRole, {
    fields: [orgUser.roleId],
    references: [organizationRole.id],
  }),
}));
