import { env } from "@hesapport-api/env/server";
import { multiSession } from "better-auth/plugins";

/**
 * Multiple accounts on the same browser/device (switch without full sign-out).
 * @see https://better-auth.com/docs/plugins/multi-session
 */
export function createMultiSessionPlugin() {
  return multiSession({
    maximumSessions: env.MULTI_SESSION_MAXIMUM_SESSIONS,
  });
}
