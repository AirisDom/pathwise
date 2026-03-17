import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import worksheetsRoutes from "./modules/worksheets/worksheets.routes";
import screeningRoutes from "./modules/screening/screening.routes";
import postsRoutes from "./modules/posts/posts.routes";
import resourcesRoutes from "./modules/resources/resources.routes";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(globalLimiter);

// Health check (no auth required)
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/worksheets", worksheetsRoutes);
app.use("/api/v1/screening", screeningRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/resources", resourcesRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Endpoint not found", code: "NOT_FOUND" });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
