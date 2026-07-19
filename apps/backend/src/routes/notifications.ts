import { Router } from "express";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notifications.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get("/", asyncHandler(listNotifications));
notificationRoutes.patch("/read-all", asyncHandler(markAllNotificationsRead));
notificationRoutes.patch("/:id/read", asyncHandler(markNotificationRead));
notificationRoutes.delete("/:id", asyncHandler(deleteNotification));
