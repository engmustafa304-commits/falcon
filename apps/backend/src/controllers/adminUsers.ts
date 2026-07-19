import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

const publicUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  isActive: true,
  name: true,
  phone: true,
  role: true,
  tenantId: true,
  updatedAt: true
} as const;

const roleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "DEALER_OWNER", "DEALER_MANAGER", "CUSTOMER"])
});

const statusSchema = z.object({
  isActive: z.boolean()
});

export async function listAdminUsers(_request: Request, response: Response) {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: publicUserSelect
  });

  response.status(200).json({ data: users });
}

export async function updateAdminUserRole(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = roleSchema.parse(request.body);
  const user = await prisma.user.update({
    data: {
      role: payload.role
    },
    select: publicUserSelect,
    where: {
      id
    }
  });

  response.status(200).json({ data: user });
}

export async function updateAdminUserStatus(request: Request, response: Response) {
  const id = String(request.params.id);
  const payload = statusSchema.parse(request.body);

  if (request.auth?.userId === id && !payload.isActive) {
    throw new ApiError(400, "Cannot deactivate your own admin account", undefined, "CANNOT_DEACTIVATE_SELF");
  }

  const user = await prisma.user.update({
    data: {
      isActive: payload.isActive
    },
    select: publicUserSelect,
    where: {
      id
    }
  });

  response.status(200).json({ data: user });
}

export async function deleteAdminUser(request: Request, response: Response) {
  const id = String(request.params.id);

  if (request.auth?.userId === id) {
    throw new ApiError(400, "Cannot delete your own admin account", undefined, "CANNOT_DELETE_SELF");
  }

  await prisma.user.delete({
    where: {
      id
    }
  });

  response.status(204).send();
}
