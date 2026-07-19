import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

const createDealerSchema = z.object({
  city: z.string().min(1),
  email: z.string().email().optional(),
  isVerified: z.boolean().optional(),
  name: z.string().min(1),
  phone: z.string().min(5).optional(),
  tenantId: z.string().min(1)
});

const updateDealerSchema = createDealerSchema.partial();

const dealerInclude = {
  _count: {
    select: {
      cars: true
    }
  }
} as const;

export async function listDealers(_request: Request, response: Response) {
  const dealers = await prisma.dealer.findMany({
    include: dealerInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  response.status(200).json({ data: dealers });
}

export async function createDealer(request: Request, response: Response) {
  const payload = createDealerSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  if (!isAdminRole(auth.role)) {
    if (auth.role !== "DEALER_OWNER") {
      throw new ApiError(403, "Dealer access is required", undefined, "FORBIDDEN");
    }

    const existingDealer = await prisma.dealer.findFirst({
      select: {
        id: true
      },
      where: {
        ownerUserId: auth.userId
      }
    });

    if (existingDealer) {
      throw new ApiError(409, "Dealer profile already exists", undefined, "DEALER_ALREADY_EXISTS");
    }
  }

  const dealer = await prisma.dealer.create({
    data: {
      ...payload,
      ownerUserId: isAdminRole(auth.role) ? undefined : auth.userId,
      tenantId: isAdminRole(auth.role) ? payload.tenantId : auth.tenantId
    },
    include: dealerInclude
  });

  response.status(201).json({ data: dealer });
}

export async function getMyDealer(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  if (auth.role !== "DEALER_OWNER" && auth.role !== "DEALER_MANAGER") {
    throw new ApiError(403, "Dealer access is required", undefined, "FORBIDDEN");
  }

  const dealer = await prisma.dealer.findFirst({
    include: {
      cars: {
        orderBy: {
          createdAt: "desc"
        }
      },
      ...dealerInclude
    },
    where: {
      ownerUserId: auth.userId,
      tenantId: auth.tenantId
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer profile not found", undefined, "DEALER_PROFILE_NOT_FOUND");
  }

  response.status(200).json({ data: dealer });
}

export async function getDealerById(request: Request, response: Response) {
  const id = String(request.params.id);
  const dealer = await prisma.dealer.findUnique({
    include: {
      cars: {
        orderBy: {
          createdAt: "desc"
        }
      },
      _count: {
        select: {
          cars: true
        }
      }
    },
    where: {
      id
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer not found", undefined, "DEALER_NOT_FOUND");
  }

  response.status(200).json({ data: dealer });
}

export async function updateDealer(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = updateDealerSchema.parse(request.body);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageDealer(auth, id);

  const dealer = await prisma.dealer.update({
    data: isAdminRole(auth.role)
      ? payload
      : {
          ...payload,
          ownerUserId: auth.userId,
          tenantId: auth.tenantId
        },
    include: dealerInclude,
    where: {
      id
    }
  });

  response.status(200).json({ data: dealer });
}

export async function updateMyDealer(request: Request, response: Response) {
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
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

  request.params.id = dealer.id;
  await updateDealer(request, response);
}

export async function deleteDealer(request: Request, response: Response) {
  const id = String(request.params.id);
  const auth = request.auth;

  if (!auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  await assertCanManageDealer(auth, id);

  await prisma.dealer.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}

function isAdminRole(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

async function assertCanManageDealer(auth: NonNullable<Request["auth"]>, dealerId: string) {
  if (isAdminRole(auth.role)) {
    return;
  }

  const dealer = await prisma.dealer.findUnique({
    select: {
      ownerUserId: true,
      tenantId: true
    },
    where: {
      id: dealerId
    }
  });

  if (!dealer) {
    throw new ApiError(404, "Dealer not found", undefined, "DEALER_NOT_FOUND");
  }

  if (dealer.ownerUserId !== auth.userId || dealer.tenantId !== auth.tenantId) {
    throw new ApiError(403, "Cannot manage another dealer profile", undefined, "FORBIDDEN");
  }
}
