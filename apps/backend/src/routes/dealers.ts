import { Router } from "express";
import {
  createDealer,
  deleteDealer,
  getDealerById,
  getMyDealer,
  listDealers,
  updateDealer,
  updateMyDealer
} from "../controllers/dealers.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dealerRoutes = Router();

dealerRoutes.get("/", asyncHandler(listDealers));
dealerRoutes.post("/", requireAuth, asyncHandler(createDealer));
dealerRoutes.get("/me", requireAuth, asyncHandler(getMyDealer));
dealerRoutes.patch("/me", requireAuth, asyncHandler(updateMyDealer));
dealerRoutes.get("/:id", asyncHandler(getDealerById));
dealerRoutes.patch("/:id", requireAuth, asyncHandler(updateDealer));
dealerRoutes.delete("/:id", requireAuth, asyncHandler(deleteDealer));
