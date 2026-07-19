import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
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

const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  name: z.string().min(2),
  password: z.string().min(8),
  phone: z.string().min(5).optional(),
  role: z.enum(["DEALER_OWNER", "CUSTOMER"]).optional(),
  tenantId: z.string().min(1).default("local-dev")
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1)
});

export async function register(request: Request, response: Response) {
  const payload = registerSchema.parse(request.body);
  const existingUser = await prisma.user.findUnique({
    select: {
      id: true
    },
    where: {
      email: payload.email
    }
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered", undefined, "EMAIL_ALREADY_REGISTERED");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const role = payload.role ?? "CUSTOMER";
  const user = await prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
        phone: payload.phone,
        role,
        tenantId: payload.tenantId
      },
      select: publicUserSelect
    });

    if (createdUser.role === "DEALER_OWNER") {
      await transaction.dealer.create({
        data: {
          city: "الرياض",
          email: createdUser.email,
          isVerified: false,
          name: createdUser.name || "معرض جديد",
          ownerUserId: createdUser.id,
          phone: createdUser.phone,
          tenantId: createdUser.tenantId
        }
      });
    }

    return createdUser;
  });

  response.status(201).json({
    data: {
      token: signAccessToken(user),
      user
    }
  });
}

export async function login(request: Request, response: Response) {
  const payload = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password", undefined, "INVALID_CREDENTIALS");
  }

  const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password", undefined, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive", undefined, "USER_INACTIVE");
  }

  const publicUser = {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    name: user.name,
    phone: user.phone,
    role: user.role,
    tenantId: user.tenantId,
    updatedAt: user.updatedAt
  };

  response.status(200).json({
    data: {
      token: signAccessToken(publicUser),
      user: publicUser
    }
  });
}

export async function getCurrentUser(request: Request, response: Response) {
  if (!request.auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    select: publicUserSelect,
    where: {
      id: request.auth.userId
    }
  });

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists", undefined, "UNAUTHORIZED");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive", undefined, "USER_INACTIVE");
  }

  response.status(200).json({ data: user });
}

function signAccessToken(user: { id: string; role: string; tenantId: string }) {
  return jwt.sign(
    {
      role: user.role,
      tenantId: user.tenantId
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: "7d",
      subject: user.id
    }
  );
}
