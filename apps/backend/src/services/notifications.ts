import type { NotificationType } from "@prisma/client";
import { prisma } from "../database/prismaClient.js";

type NotificationInput = {
  message: string;
  title: string;
  type: NotificationType;
  userId: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: input
  });
}

export async function createDealerOwnerNotification({
  dealerId,
  message,
  title,
  type
}: {
  dealerId?: string | null;
  message: string;
  title: string;
  type: NotificationType;
}) {
  if (!dealerId) {
    return null;
  }

  const dealer = await prisma.dealer.findUnique({
    select: {
      ownerUserId: true
    },
    where: {
      id: dealerId
    }
  });

  if (!dealer?.ownerUserId) {
    return null;
  }

  return createNotification({
    message,
    title,
    type,
    userId: dealer.ownerUserId
  });
}
