import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middlewares/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import recordRoutes from "./modules/record/record.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const openApiSpec = JSON.parse(
  readFileSync(join(__dirname, "docs/openapi.json"), "utf8")
);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// OpenAPI / Swagger UI (API documentation)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Finance Dashboard API running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;