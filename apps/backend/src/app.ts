import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { apiRateLimiter, authRateLimiter, uploadRateLimiter } from "./middlewares/rateLimiters.js";
import { requestContext } from "./middlewares/requestContext.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { getHealth, getReadiness } from "./health/health.controller.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { carRoutes } from "./routes/cars.js";
import { dealerRoutes } from "./routes/dealers.js";
import { apiRoutes } from "./routes/index.js";

export const app = express();
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corsOrigins = env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];

app.use(helmet());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.includes(origin) || ((env.NODE_ENV === "development" || env.NODE_ENV === "test") && corsOrigins.length === 0)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by Falcon CORS policy"));
  }
}));
app.use("/uploads", express.static(path.join(backendRoot, "uploads")));
app.use(express.json({ limit: "1mb" }));
app.use(requestContext);
app.use(requestLogger);

app.get("/health", getHealth);
app.get("/ready", asyncHandler(getReadiness));
app.use("/api/v1/auth", authRateLimiter);
app.use("/api/v1/uploads", uploadRateLimiter);
app.use("/api/v1", apiRateLimiter, apiRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/dealers", dealerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
