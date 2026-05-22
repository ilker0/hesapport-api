import { createAdminRouter } from "@hesapport-api/admin";
import { createContext } from "@hesapport-api/api/context";
import { appRouter } from "@hesapport-api/api/routers/index";
import { auth } from "@hesapport-api/auth";
import { env } from "@hesapport-api/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

const app = express();

const corsOrigins = [env.CORS_ORIGIN, ...(env.ADMIN_CORS_ORIGIN ? [env.ADMIN_CORS_ORIGIN] : [])];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use("/admin", createAdminRouter());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("Admin API: http://localhost:3000/admin");
  console.log("Admin login: POST http://localhost:3000/admin/auth/login");
});
