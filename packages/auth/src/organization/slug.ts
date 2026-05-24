export function buildOrganizationSlug(user: { id: string; name: string; email: string }): string {
  const fromName = user.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const fromEmail = user.email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "user";
  const base = fromName || fromEmail || "org";
  return `${base}-${user.id.slice(0, 8)}`;
}

export function buildOrganizationName(user: { name: string }): string {
  const trimmed = user.name.trim();
  return trimmed ? `${trimmed}'s Organization` : "My Organization";
}
