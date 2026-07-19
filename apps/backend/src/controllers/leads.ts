import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";
import { createDealerOwnerNotification } from "../services/notifications.js";

const leadInclude = {
  car: {
    select: {
      brand: true,
      id: true,
      model: true,
      name: true,
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

const createLeadSchema = z.object({
  carId: z.string().min(1).optional(),
  dealerId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  message: z.string().min(1).optional(),
  name: z.string().min(2),
  phone: z.string().min(5),
  source: z.enum(["CAR_DETAIL", "DEALER_PAGE", "FINANCE_REQUEST", "WHATSAPP_CLICK"]).default("CAR_DETAIL")
});

const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "WON", "LOST"])
});

export async function createLead(request: Request, response: Response) {
  const payload = createLeadSchema.parse(request.body);
  const context = await resolveLeadContext(payload.carId, payload.dealerId);

  const lead = await prisma.lead.create({
    data: {
      carId: payload.carId,
      dealerId: context.dealerId,
      email: payload.email,
      message: payload.message,
      name: payload.name,
      phone: payload.phone,
      source: payload.source,
      tenantId: context.tenantId,
      userId: request.auth?.userId
    },
    include: leadInclude
  });

  await createDealerOwnerNotification({
    dealerId: context.dealerId,
    message: `${lead.name} أرسل طلب تواصل على ${lead.car?.name ?? "إحدى سياراتك"}.`,
    title: "طلب تواصل جديد",
    type: "LEAD"
  });

  response.status(201).json({ data: lead });
}

export async function listMyLeads(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const leads = await prisma.lead.findMany({
    include: leadInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      userId: auth.userId
    }
  });

  response.status(200).json({ data: leads });
}

export async function listDealerLeads(request: Request, response: Response) {
  const dealer = await getAuthenticatedDealer(request);
  const leads = await prisma.lead.findMany({
    include: leadInclude,
    orderBy: {
      createdAt: "desc"
    },
    where: {
      dealerId: dealer.id
    }
  });

  response.status(200).json({ data: leads });
}

export async function updateDealerLeadStatus(request: Request, response: Response) {
  const dealer = await getAuthenticatedDealer(request);
  const id = String(request.params.id);
  const payload = updateLeadStatusSchema.parse(request.body);
  const existingLead = await prisma.lead.findUnique({
    select: {
      dealerId: true
    },
    where: {
      id
    }
  });

  if (!existingLead) {
    throw new ApiError(404, "Lead not found", undefined, "LEAD_NOT_FOUND");
  }

  if (existingLead.dealerId !== dealer.id) {
    throw new ApiError(403, "Cannot manage another dealer's leads", undefined, "FORBIDDEN");
  }

  const lead = await prisma.lead.update({
    data: {
      status: payload.status
    },
    include: leadInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: lead });
}

export async function listAdminLeads(_request: Request, response: Response) {
  const leads = await prisma.lead.findMany({
    include: leadInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  response.status(200).json({ data: leads });
}

export async function updateAdminLeadStatus(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateLeadStatusSchema.parse(request.body);
  const lead = await prisma.lead.update({
    data: {
      status: payload.status
    },
    include: leadInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: lead });
}

export async function deleteAdminLead(request: Request, response: Response) {
  const id = String(request.params.id);

  await prisma.lead.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

async function resolveLeadContext(carId?: string, dealerId?: string) {
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
