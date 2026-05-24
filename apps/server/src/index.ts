import { createAdminRouter } from "@hesapport-api/admin-api";
import { createAppRouter, errorHandler } from "@hesapport-api/api";
import { auth } from "@hesapport-api/auth";
import { env } from "@hesapport-api/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

const app = express();

const productionCorsOrigins = [env.CORS_ORIGIN, ...(env.ADMIN_CORS_ORIGIN ? [env.ADMIN_CORS_ORIGIN] : [])];
const developmentCorsOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: env.NODE_ENV === "production" ? productionCorsOrigins : developmentCorsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json());

if (env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });
}

app.use("/api", createAppRouter());
app.use("/admin", createAdminRouter());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`App API: http://localhost:${port}/api`);
  console.log(`Admin API: http://localhost:${port}/admin`);
  console.log(`Auth: http://localhost:${port}/api/auth`);
});
