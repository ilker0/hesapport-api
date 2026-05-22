-- Default permissions (resource + action)
INSERT INTO "permission" ("id", "resource", "action", "description") VALUES
  ('perm_user_create', 'user', 'create', 'Create users'),
  ('perm_user_list', 'user', 'list', 'List users'),
  ('perm_user_get', 'user', 'get', 'View user details'),
  ('perm_user_update', 'user', 'update', 'Update users'),
  ('perm_user_delete', 'user', 'delete', 'Delete users'),
  ('perm_user_set_role', 'user', 'set-role', 'Change user roles'),
  ('perm_user_ban', 'user', 'ban', 'Ban users'),
  ('perm_user_impersonate', 'user', 'impersonate', 'Impersonate users'),
  ('perm_user_impersonate_admins', 'user', 'impersonate-admins', 'Impersonate admin users'),
  ('perm_user_set_password', 'user', 'set-password', 'Set user passwords'),
  ('perm_session_list', 'session', 'list', 'List sessions'),
  ('perm_session_revoke', 'session', 'revoke', 'Revoke a session'),
  ('perm_session_delete', 'session', 'delete', 'Delete sessions'),
  ('perm_todo_create', 'todo', 'create', 'Create todos'),
  ('perm_todo_read', 'todo', 'read', 'Read todos'),
  ('perm_todo_update', 'todo', 'update', 'Update todos'),
  ('perm_todo_delete', 'todo', 'delete', 'Delete todos'),
  ('perm_todo_list', 'todo', 'list', 'List todos'),
  ('perm_settings_read', 'settings', 'read', 'Read settings'),
  ('perm_settings_update', 'settings', 'update', 'Update settings'),
  ('perm_role_create', 'role', 'create', 'Create roles'),
  ('perm_role_list', 'role', 'list', 'List roles'),
  ('perm_role_get', 'role', 'get', 'View role details'),
  ('perm_role_update', 'role', 'update', 'Update roles'),
  ('perm_role_delete', 'role', 'delete', 'Delete roles'),
  ('perm_permission_list', 'permission', 'list', 'List permissions'),
  ('perm_permission_assign', 'permission', 'assign', 'Assign permissions to roles')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Default roles
INSERT INTO "role" ("id", "name", "display_name", "description", "is_system") VALUES
  ('role_admin', 'admin', 'Administrator', 'Full system access', true),
  ('role_manager', 'manager', 'Manager', 'Manage users and application data', true),
  ('role_user', 'user', 'User', 'Standard application user', true),
  ('role_viewer', 'viewer', 'Viewer', 'Read-only access', true)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- Admin: all permissions
INSERT INTO "role_permission" ("role_id", "permission_id")
SELECT 'role_admin', p.id FROM "permission" p
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Manager permissions
INSERT INTO "role_permission" ("role_id", "permission_id") VALUES
  ('role_manager', 'perm_user_list'),
  ('role_manager', 'perm_user_get'),
  ('role_manager', 'perm_user_update'),
  ('role_manager', 'perm_session_list'),
  ('role_manager', 'perm_todo_create'),
  ('role_manager', 'perm_todo_read'),
  ('role_manager', 'perm_todo_update'),
  ('role_manager', 'perm_todo_delete'),
  ('role_manager', 'perm_todo_list'),
  ('role_manager', 'perm_settings_read'),
  ('role_manager', 'perm_role_list'),
  ('role_manager', 'perm_permission_list')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- User permissions
INSERT INTO "role_permission" ("role_id", "permission_id") VALUES
  ('role_user', 'perm_todo_create'),
  ('role_user', 'perm_todo_read'),
  ('role_user', 'perm_todo_update'),
  ('role_user', 'perm_todo_delete'),
  ('role_user', 'perm_todo_list'),
  ('role_user', 'perm_settings_read')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Viewer permissions
INSERT INTO "role_permission" ("role_id", "permission_id") VALUES
  ('role_viewer', 'perm_todo_read'),
  ('role_viewer', 'perm_todo_list'),
  ('role_viewer', 'perm_settings_read')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Migrate legacy user.role values to user_role mappings
INSERT INTO "user_role" ("user_id", "role_id")
SELECT u.id, r.id
FROM "user" u
CROSS JOIN LATERAL unnest(string_to_array(COALESCE(u.role, 'user'), ',')) AS role_name(raw_name)
INNER JOIN "role" r ON r.name = trim(role_name.raw_name)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Assign default "user" role to users still without any role mapping
INSERT INTO "user_role" ("user_id", "role_id")
SELECT u.id, 'role_user'
FROM "user" u
WHERE NOT EXISTS (
  SELECT 1 FROM "user_role" ur WHERE ur.user_id = u.id
)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Sync Better Auth user.role field from user_role (comma-separated slugs)
UPDATE "user" u
SET "role" = sub.roles
FROM (
  SELECT ur.user_id, string_agg(r.name, ',' ORDER BY r.name) AS roles
  FROM "user_role" ur
  INNER JOIN "role" r ON r.id = ur.role_id
  GROUP BY ur.user_id
) sub
WHERE u.id = sub.user_id;
