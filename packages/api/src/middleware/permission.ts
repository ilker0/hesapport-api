import { userHasPermission, type PermissionCheck } from "@hesapport-api/auth";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../index";

export function requirePermission(permissions: PermissionCheck) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const allowed = await userHasPermission(ctx.session.user.id, permissions);

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return next({ ctx });
  });
}
