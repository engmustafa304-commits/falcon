import type { Request, Response } from "express";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

export async function listNotifications(request: Request, response: Response) {
  const auth = getNotificationAuth(request);
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: notifications });
}

export async function markNotificationRead(request: Request, response: Response) {
  const auth = getNotificationAuth(request);
  const id = String(request.params.id);
  await assertNotificationOwnership(id, auth.userId);

  const notification = await prisma.notification.update({
    data: {
      isRead: true
    },
    where: {
      id
    }
  });

  response.status(200).json({ data: notification });
}

export async function markAllNotificationsRead(request: Request, response: Response) {
  const auth = getNotificationAuth(request);

  await prisma.notification.updateMany({
    data: {
      isRead: true
    },
    where: {
      isRead: false,
      userId: auth.userId
    }
  });

  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: notifications });
}

export async function deleteNotification(request: Request, response: Response) {
  const auth = getNotificationAuth(request);
  const id = String(request.params.id);
  await assertNotificationOwnership(id, auth.userId);

  await prisma.notification.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

function getNotificationAuth(request: Request) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  return auth;
}

async function assertNotificationOwnership(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    select: {
      userId: true
    },
    where: {
      id
    }
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found", undefined, "NOTIFICATION_NOT_FOUND");
  }

  if (notification.userId !== userId) {
    throw new ApiError(403, "Cannot manage another user's notifications", undefined, "FORBIDDEN");
  }
}
