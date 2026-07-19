import { Router } from "express";
import {
  createFinanceRequest,
  listMyFinanceRequests,
  listDealerFinanceRequests,
  updateDealerFinanceRequestStatus
} from "../controllers/financeRequests.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuthMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const financeRequestRoutes = Router();
export const dealerFinanceRequestRoutes = Router();

financeRequestRoutes.post("/", optionalAuth, asyncHandler(createFinanceRequest));
financeRequestRoutes.get("/me", requireAuth, asyncHandler(listMyFinanceRequests));

dealerFinanceRequestRoutes.use(requireAuth);
dealerFinanceRequestRoutes.get("/", asyncHandler(listDealerFinanceRequests));
dealerFinanceRequestRoutes.patch("/:id/status", asyncHandler(updateDealerFinanceRequestStatus));
