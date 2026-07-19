import { Router } from "express";
import {
  deleteAdminCar,
  listAdminCars,
  updateAdminCar,
  updateAdminCarStatus
} from "../controllers/adminCars.js";
import { getAdminAnalytics } from "../controllers/analytics.js";
import {
  deleteAdminDealer,
  listAdminDealers,
  updateAdminDealer,
  updateAdminDealerVerification
} from "../controllers/adminDealers.js";
import {
  deleteAdminLead,
  listAdminLeads,
  updateAdminLeadStatus
} from "../controllers/leads.js";
import {
  deleteAdminFinanceRequest,
  listAdminFinanceRequests,
  updateAdminFinanceRequestStatus
} from "../controllers/financeRequests.js";
import {
  deleteAdminUser,
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus
} from "../controllers/adminUsers.js";
import { getAdminStorageStatus } from "../controllers/storage.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireSuperAdmin } from "../middlewares/requireSuperAdmin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireSuperAdmin);
adminRoutes.get("/analytics", asyncHandler(getAdminAnalytics));
adminRoutes.get("/storage/status", getAdminStorageStatus);
adminRoutes.get("/cars", asyncHandler(listAdminCars));
adminRoutes.patch("/cars/:id", asyncHandler(updateAdminCar));
adminRoutes.patch("/cars/:id/status", asyncHandler(updateAdminCarStatus));
adminRoutes.delete("/cars/:id", asyncHandler(deleteAdminCar));
adminRoutes.get("/dealers", asyncHandler(listAdminDealers));
adminRoutes.patch("/dealers/:id", asyncHandler(updateAdminDealer));
adminRoutes.patch("/dealers/:id/verify", asyncHandler(updateAdminDealerVerification));
adminRoutes.delete("/dealers/:id", asyncHandler(deleteAdminDealer));
adminRoutes.get("/finance-requests", asyncHandler(listAdminFinanceRequests));
adminRoutes.patch("/finance-requests/:id/status", asyncHandler(updateAdminFinanceRequestStatus));
adminRoutes.delete("/finance-requests/:id", asyncHandler(deleteAdminFinanceRequest));
adminRoutes.get("/leads", asyncHandler(listAdminLeads));
adminRoutes.patch("/leads/:id/status", asyncHandler(updateAdminLeadStatus));
adminRoutes.delete("/leads/:id", asyncHandler(deleteAdminLead));
adminRoutes.get("/users", asyncHandler(listAdminUsers));
adminRoutes.patch("/users/:id/role", asyncHandler(updateAdminUserRole));
adminRoutes.patch("/users/:id/status", asyncHandler(updateAdminUserStatus));
adminRoutes.delete("/users/:id", asyncHandler(deleteAdminUser));
