import { Router } from "express";
import { getDealerAnalytics } from "../controllers/analytics.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dealerAnalyticsRoutes = Router();

dealerAnalyticsRoutes.use(requireAuth);
dealerAnalyticsRoutes.get("/", asyncHandler(getDealerAnalytics));
