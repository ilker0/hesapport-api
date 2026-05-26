import { Router } from "express";

import { asyncHandler } from "../lib/async-handler";
import {
  addTeamMemberSchema,
  createTeamSchema,
  listTeamMembersQuerySchema,
  organizationIdQuerySchema,
  removeTeamMemberSchema,
  removeTeamSchema,
  setActiveTeamSchema,
  updateTeamSchema,
} from "../schemas/team.schema";
import * as organizationService from "../services/organization.service";

/**
 * Better Auth organization teams — proxied via auth.api.*
 * @see https://better-auth.com/docs/plugins/organization#teams
 */
export const teamsRouter = Router();

/** list-teams */
teamsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { organizationId } = organizationIdQuerySchema.parse(req.query);
    res.json(await organizationService.listTeams(req, organizationId));
  }),
);

/** list-user-teams */
teamsRouter.get(
  "/user",
  asyncHandler(async (req, res) => {
    res.json(await organizationService.listUserTeams(req));
  }),
);

/** create-team */
teamsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createTeamSchema.parse(req.body);
    res.status(201).json(await organizationService.createTeam(req, body));
  }),
);

/** update-team */
teamsRouter.post(
  "/update",
  asyncHandler(async (req, res) => {
    const body = updateTeamSchema.parse(req.body);
    res.json(await organizationService.updateTeam(req, body));
  }),
);

/** remove-team */
teamsRouter.post(
  "/remove",
  asyncHandler(async (req, res) => {
    const body = removeTeamSchema.parse(req.body);
    res.json(await organizationService.removeTeam(req, body));
  }),
);

/** set-active-team */
teamsRouter.post(
  "/set-active",
  asyncHandler(async (req, res) => {
    const body = setActiveTeamSchema.parse(req.body);
    res.json(await organizationService.setActiveTeam(req, body.teamId));
  }),
);

/** list-team-members */
teamsRouter.post(
  "/members/list",
  asyncHandler(async (req, res) => {
    const query = listTeamMembersQuerySchema.parse(req.query);
    res.json(await organizationService.listTeamMembers(req, query.teamId));
  }),
);

/** add-team-member */
teamsRouter.post(
  "/members/add",
  asyncHandler(async (req, res) => {
    const body = addTeamMemberSchema.parse(req.body);
    res.status(201).json(await organizationService.addTeamMember(req, body));
  }),
);

/** remove-team-member */
teamsRouter.post(
  "/members/remove",
  asyncHandler(async (req, res) => {
    const body = removeTeamMemberSchema.parse(req.body);
    res.json(await organizationService.removeTeamMember(req, body));
  }),
);
