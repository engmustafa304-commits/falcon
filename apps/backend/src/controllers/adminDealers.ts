import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { createDealerOwnerNotification } from "../services/notifications.js";

const dealerSelect = {
  _count: {
    select: {
      cars: true
    }
  },
  city: true,
  createdAt: true,
  email: true,
  id: true,
  isVerified: true,
  name: true,
  owner: {
    select: {
      email: true,
      id: true,
      name: true,
      phone: true,
      role: true
    }
  },
  ownerUserId: true,
  phone: true,
  tenantId: true,
  updatedAt: true
} as const;

const updateDealerSchema = z.object({
  city: z.string().min(1).optional(),
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(5).optional()
});

const verifyDealerSchema = z.object({
  isVerified: z.boolean()
});

export async function listAdminDealers(_request: Request, response: Response) {
  const dealers = await prisma.dealer.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: dealerSelect
  });

  response.status(200).json({ data: dealers });
}

export async function updateAdminDealer(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateDealerSchema.parse(request.body);
  const dealer = await prisma.dealer.update({
    data: payload,
    select: dealerSelect,
    where: {
      id
    }
  });

  response.status(200).json({ data: dealer });
}

export async function updateAdminDealerVerification(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = verifyDealerSchema.parse(request.body);
  const dealer = await prisma.dealer.update({
    data: {
      isVerified: payload.isVerified
    },
    select: dealerSelect,
    where: {
      id
    }
  });

  await createDealerOwnerNotification({
    dealerId: dealer.id,
    message: payload.isVerified
      ? "تم توثيق معرضك على منصة Falcon."
      : "تم تحديث حالة توثيق معرضك على منصة Falcon.",
    title: payload.isVerified ? "تم توثيق المعرض" : "تحديث حالة التوثيق",
    type: "DEALER"
  });

  response.status(200).json({ data: dealer });
}

export async function deleteAdminDealer(request: Request, response: Response) {
  const id = String(request.params.id);

  await prisma.dealer.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}
