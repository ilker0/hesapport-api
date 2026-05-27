import { createOrgUser } from "@hesapport-api/auth";

export async function adminCreateOrgUser(input: {
  organizationId: string;
  branchId: string;
  roleId: string;
  username: string;
  password: string;
  displayName: string;
}) {
  return createOrgUser(input);
}
