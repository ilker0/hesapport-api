import { createOrgUser } from "@hesapport-api/auth";

export async function adminCreateOrgUser(input: {
  organizationId: string;
  branchId: string;
  roleIds: string[];
  email: string;
  username: string;
  password: string;
  displayName: string;
}) {
  return createOrgUser(input);
}
