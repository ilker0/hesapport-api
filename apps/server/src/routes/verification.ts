import { renderVerificationResultPage } from "@hesapport-api/auth/verification-pages";
import { Router } from "express";

export const verificationPagesRouter = Router();

verificationPagesRouter.get("/complete", (req, res) => {
  const error =
    typeof req.query.error === "string" ? req.query.error : undefined;

  res
    .status(error ? 400 : 200)
    .type("html")
    .send(renderVerificationResultPage(error));
});
