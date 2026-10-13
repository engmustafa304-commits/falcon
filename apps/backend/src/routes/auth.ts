import { Router } from "express";
import {
  deleteSession,
  getCurrentUser,
  listSessions,
  login,
  logout,
  logoutAll,
  refresh,
  register
} from "../controllers/auth.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
authRoutes.post("/refresh", asyncHandler(refresh));
authRoutes.post("/logout", asyncHandler(logout));
authRoutes.post("/logout-all", requireAuth, asyncHandler(logoutAll));
authRoutes.get("/me", requireAuth, asyncHandler(getCurrentUser));
authRoutes.get("/sessions", requireAuth, asyncHandler(listSessions));
authRoutes.delete("/sessions/:id", requireAuth, asyncHandler(deleteSession));
