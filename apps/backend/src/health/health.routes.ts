import { Router } from "express";
import { getHealth, getReadiness } from "./health.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/ready", asyncHandler(getReadiness));
