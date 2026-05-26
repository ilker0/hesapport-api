import { env } from "@hesapport-api/env/server";

/**
 * @see https://better-auth.com/docs/plugins/organization#teams
 */
export const organizationTeamsConfig = {
  enabled: true,
  maximumTeams: env.ORG_MAXIMUM_TEAMS,
  allowRemovingAllTeams: env.ORG_ALLOW_REMOVING_ALL_TEAMS,
} as const;

/** Varsayılan takım — yeni üye kaydında org ile birlikte oluşturulur. */
export const defaultOrganizationTeamName =
  env.ORG_DEFAULT_TEAM_NAME.trim() || "Ana Şube";
