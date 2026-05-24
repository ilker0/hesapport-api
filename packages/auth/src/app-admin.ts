/** Better Auth admin plugin: `user.role` includes `admin` (comma-separated). */
export function parseUserRoles(role: string | null | undefined): string[] {
  if (!role?.trim()) return ["user"];
  return role
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

export function userIsAppAdmin(user: { role?: string | null }): boolean {
  return parseUserRoles(user.role).includes("admin");
}
