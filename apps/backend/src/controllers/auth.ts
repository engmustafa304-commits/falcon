import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";
import {
  issueTokenPair,
  listActiveSessions,
  revokeAllForUser,
  revokeRefreshToken,
  revokeSession,
  rotateRefreshToken,
  toPublicTokenPair,
  type RefreshTokenContext
} from "../services/authTokens.js";

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

// Unknown or server-owned fields (tenantId, isActive, ...) are stripped by Zod and ignored.
const deviceNameSchema = z.string().trim().min(1).max(100).optional();

const registerSchema = z.object({
  deviceName: deviceNameSchema,
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  name: z.string().min(2),
  password: z.string().min(8),
  phone: z.string().min(5).optional(),
  role: z.enum(["DEALER_OWNER", "CUSTOMER"]).optional()
});

const loginSchema = z.object({
  deviceName: deviceNameSchema,
  email: z.string().email().transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  deviceName: deviceNameSchema,
  refreshToken: z.string().min(1)
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1)
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
        tenantId: env.DEFAULT_TENANT_ID
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

  const tokens = await issueTokenPair(user, getRefreshTokenContext(request, payload.deviceName));

  response.status(201).json({ data: buildAuthPayload(toPublicTokenPair(tokens), user) });
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

  const tokens = await issueTokenPair(publicUser, getRefreshTokenContext(request, payload.deviceName));

  response.status(200).json({ data: buildAuthPayload(toPublicTokenPair(tokens), publicUser) });
}

export async function refresh(request: Request, response: Response) {
  const payload = refreshSchema.parse(request.body);
  const { tokens, userId } = await rotateRefreshToken(payload.refreshToken, getRefreshTokenContext(request, payload.deviceName));
  const user = await prisma.user.findUniqueOrThrow({
    select: publicUserSelect,
    where: {
      id: userId
    }
  });

  response.status(200).json({ data: buildAuthPayload(tokens, user) });
}

export async function logout(request: Request, response: Response) {
  const payload = logoutSchema.parse(request.body);
  await revokeRefreshToken(payload.refreshToken);

  response.status(204).send();
}

export async function logoutAll(request: Request, response: Response) {
  const auth = requireRequestAuth(request);
  await revokeAllForUser(auth.userId);

  response.status(204).send();
}

export async function listSessions(request: Request, response: Response) {
  const auth = requireRequestAuth(request);
  const sessions = await listActiveSessions(auth.userId);

  response.status(200).json({ data: sessions });
}

export async function deleteSession(request: Request, response: Response) {
  const auth = requireRequestAuth(request);
  await revokeSession(auth.userId, String(request.params.id));

  response.status(204).send();
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

function requireRequestAuth(request: Request) {
  if (!request.auth) {
    throw new ApiError(401, "Authentication is required", undefined, "UNAUTHORIZED");
  }

  return request.auth;
}

function getRefreshTokenContext(request: Request, deviceName?: string): RefreshTokenContext {
  return {
    deviceName,
    ip: request.ip,
    userAgent: request.header("user-agent")?.slice(0, 500)
  };
}

function buildAuthPayload<TUser>(tokens: ReturnType<typeof toPublicTokenPair>, user: TUser) {
  return {
    ...tokens,
    /** @deprecated Use `accessToken`. Kept for clients built before refresh tokens existed. */
    token: tokens.accessToken,
    user
  };
}
