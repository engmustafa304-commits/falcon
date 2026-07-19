import { Router } from "express";
import {
  createLead,
  listMyLeads,
  listDealerLeads,
  updateDealerLeadStatus
} from "../controllers/leads.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuthMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const leadRoutes = Router();
export const dealerLeadRoutes = Router();

leadRoutes.post("/", optionalAuth, asyncHandler(createLead));
leadRoutes.get("/me", requireAuth, asyncHandler(listMyLeads));

dealerLeadRoutes.use(requireAuth);
dealerLeadRoutes.get("/", asyncHandler(listDealerLeads));
dealerLeadRoutes.patch("/:id/status", asyncHandler(updateDealerLeadStatus));
