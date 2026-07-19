import { apiDelete, apiGet, apiPatch } from "./apiClient";

export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "LEAD"
  | "FINANCE"
  | "CAR"
  | "DEALER";

export type AppNotification = {
  createdAt: string;
  id: string;
  isRead: boolean;
  message: string;
  title: string;
  type: NotificationType;
  userId: string;
};

export function getNotifications() {
  return apiGet<AppNotification[]>("/notifications");
}

export function markNotificationRead(id: string) {
  return apiPatch<AppNotification, Record<string, never>>(`/notifications/${id}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPatch<AppNotification[], Record<string, never>>("/notifications/read-all", {});
}

export function deleteNotification(id: string) {
  return apiDelete(`/notifications/${id}`);
}
