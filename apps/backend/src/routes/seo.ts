import { Router } from "express";
import { getSitemapData } from "../controllers/seo.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const seoRoutes = Router();

seoRoutes.get("/sitemap-data", asyncHandler(getSitemapData));
