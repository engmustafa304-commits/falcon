import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";
import { createDealerOwnerNotification } from "../services/notifications.js";

const financeRequestInclude = {
  car: {
    select: {
      brand: true,
      id: true,
      model: true,
      name: true,
      price: true,
      year: true
    }
  },
  dealer: {
    select: {
      id: true,
      name: true,
      ownerUserId: true
    }
  }
} as const;

const createFinanceRequestSchema = z.object({
  carId: z.string().min(1).optional(),
  dealerId: z.string().min(1).optional(),
  customerName: z.string().min(2),
  downPayment: z.coerce.number().int().min(0).optional(),
  email: z.string().email().optional(),
  employmentType: z.string().min(1).optional(),
  financingPeriod: z.coerce.number().int().positive().optional(),
  monthlyIncome: z.coerce.number().int().min(0).optional(),
  phone: z.string().min(5)
});

const updateFinanceRequestStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "APPROVED", "REJECTED"])
});

export async function createFinanceRequest(request: Request, response: Response) {
  const payload = createFinanceRequestSchema.parse(request.body);
  const context = await resolveFinanceRequestContext(payload.carId, payload.dealerId);

  const financeRequest = await prisma.financeRequest.create({
    data: {
      carId: payload.carId,
      customerName: payload.customerName,
      dealerId: context.dealerId,
      downPayment: payload.downPayment,
      email: payload.email,
      employmentType: payload.employmentType,
      financingPeriod: payload.financingPeriod,
      monthlyIncome: payload.monthlyIncome,
      phone: payload.phone,
      tenantId: context.tenantId,
      userId: request.auth?.userId
    },
    include: financeRequestInclude
  });

  await createDealerOwnerNotification({
    dealerId: context.dealerId,
    message: `${financeRequest.customerName} أرسل طلب تمويل على ${financeRequest.car?.name ?? "إحدى سياراتك"}.`,
    title: "طلب تمويل جديد",
    type: "FINANCE"
  });

  response.status(201).json({ data: financeRequest });
}

export async function listMyFinanceRequests(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const financeRequests = await prisma.financeRequest.findMany({
    include: financeRequestInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: financeRequests });
}

export async function listDealerFinanceRequests(request: Request, response: Response) {
  const dealer = await getAuthenticatedDealer(request);
  const financeRequests = await prisma.financeRequest.findMany({
    include: financeRequestInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      dealerId: dealer.id
    }
  });

  response.status(200).json({ data: financeRequests });
}

export async function updateDealerFinanceRequestStatus(request: Request, response: Response) {
  const dealer = await getAuthenticatedDealer(request);
  const id = String(request.params.id);
  const payload = updateFinanceRequestStatusSchema.parse(request.body);
  const existingRequest = await prisma.financeRequest.findUnique({
    select: {
      dealerId: true
    },
    where: {
      id
    }
  });

  if (!existingRequest) {
    throw new ApiError(404, "Finance request not found", undefined, "FINANCE_REQUEST_NOT_FOUND");
  }

  if (existingRequest.dealerId !== dealer.id) {
    throw new ApiError(403, "Cannot manage another dealer's finance requests", undefined, "FORBIDDEN");
  }

  const financeRequest = await prisma.financeRequest.update({
    data: {
      status: payload.status
    },
    include: financeRequestInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: financeRequest });
}

export async function listAdminFinanceRequests(_request: Request, response: Response) {
  const financeRequests = await prisma.financeRequest.findMany({
    include: financeRequestInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  response.status(200).json({ data: financeRequests });
}

export async function updateAdminFinanceRequestStatus(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateFinanceRequestStatusSchema.parse(request.body);
  const financeRequest = await prisma.financeRequest.update({
    data: {
      status: payload.status
    },
    include: financeRequestInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: financeRequest });
}

export async function deleteAdminFinanceRequest(request: Request, response: Response) {
  const id = String(request.params.id);

  await prisma.financeRequest.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

async function resolveFinanceRequestContext(carId?: string, dealerId?: string) {
  if (carId) {
    const car = await prisma.car.findUnique({
      select: {
        dealerId: true,
        tenantId: true
      },
      where: {
        id: carId
      }
    });

    if (!car) {
      throw new ApiError(404, "Car not found", undefined, "CAR_NOT_FOUND");
    }

    return {
      dealerId: dealerId ?? car.dealerId,
      tenantId: car.tenantId
    };
  }

  if (dealerId) {
    const dealer = await prisma.dealer.findUnique({
      select: {
        id: true,
        tenantId: true
      },
      where: {
        id: dealerId
      }
    });

    if (!dealer) {
      throw new ApiError(404, "Dealer not found", undefined, "DEALER_NOT_FOUND");
    }

    return {
      dealerId: dealer.id,
      tenantId: dealer.tenantId
    };
  }

  return {
    dealerId: undefined,
    tenantId: "local-dev"
  };
}

async function getAuthenticatedDealer(request: Request) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  if (auth.role !== "DEALER_OWNER" && auth.role !== "DEALER_MANAGER") {
    throw new ApiError(403, "Dealer access is required", undefined, "FORBIDDEN");
  }

  const dealer = await prisma.dealer.findFirst({
    select: {
      id: true
    },
    where: {
      ownerUserId: auth.userId,
      tenantId: auth.tenantId
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer profile not found", undefined, "DEALER_PROFILE_NOT_FOUND");
  }

  return dealer;
}
