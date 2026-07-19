import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { createDealerOwnerNotification } from "../services/notifications.js";

const carImageOrderBy: Prisma.CarImageOrderByWithRelationInput[] = [
  {
    isMain: "desc"
  },
  {
    sortOrder: "asc"
  },
  {
    createdAt: "asc"
  }
];

const carSelect = {
  brand: true,
  city: true,
  createdAt: true,
  dealer: {
    select: {
      city: true,
      id: true,
      isVerified: true,
      name: true,
      owner: {
        select: {
          email: true,
          id: true,
          name: true
        }
      }
    }
  },
  dealerId: true,
  fuel: true,
  id: true,
  images: {
    orderBy: carImageOrderBy,
    select: {
      alt: true,
      carId: true,
      createdAt: true,
      id: true,
      isMain: true,
      sortOrder: true,
      url: true
    }
  },
  imageUrl: true,
  mileage: true,
  model: true,
  name: true,
  price: true,
  status: true,
  tenantId: true,
  transmission: true,
  updatedAt: true,
  year: true
} as const;

const updateCarSchema = z.object({
  brand: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  fuel: z.string().min(1).optional(),
  imageUrl: z.string().min(1).optional(),
  mileage: z.coerce.number().int().min(0).optional(),
  model: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  price: z.coerce.number().int().positive().optional(),
  transmission: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional()
});

const statusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "SOLD"])
});

export async function listAdminCars(request: Request, response: Response) {
  const dealerId = typeof request.query.dealerId === "string" ? request.query.dealerId.trim() : "";
  const cars = await prisma.car.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: carSelect,
    where: dealerId
      ? {
          dealerId
        }
      : undefined
  });

  response.status(200).json({ data: cars });
}

export async function updateAdminCar(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateCarSchema.parse(request.body);
  const car = await prisma.car.update({
    data: payload,
    select: carSelect,
    where: {
      id
    }
  });

  response.status(200).json({ data: car });
}

export async function updateAdminCarStatus(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = statusSchema.parse(request.body);
  const car = await prisma.car.update({
    data: {
      status: payload.status
    },
    select: carSelect,
    where: {
      id
    }
  });

  await createDealerOwnerNotification({
    dealerId: car.dealerId,
    message: `تم تغيير حالة إعلان ${car.name ?? "السيارة"} إلى ${getCarStatusLabel(payload.status)}.`,
    title: "تحديث حالة السيارة",
    type: "CAR"
  });

  response.status(200).json({ data: car });
}

export async function deleteAdminCar(request: Request, response: Response) {
  const id = String(request.params.id);

  await prisma.car.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

function getCarStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    SOLD: "مباع",
    SUSPENDED: "موقوف"
  };

  return labels[status] ?? status;
}
