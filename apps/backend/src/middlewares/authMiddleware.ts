import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

type TokenPayload = jwt.JwtPayload & {
  role?: string;
  tenantId?: string;
};

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    next(new ApiError(401, "Missing bearer token", undefined, "UNAUTHORIZED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    const userId = typeof payload.sub === "string" ? payload.sub : null;

    if (!userId) {
      throw new ApiError(401, "Invalid bearer token", undefined, "UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      select: {
        id: true,
        isActive: true,
        role: true,
        tenantId: true
      },
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new ApiError(401, "Authenticated user no longer exists", undefined, "UNAUTHORIZED");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account is inactive", undefined, "USER_INACTIVE");
    }

    request.auth = {
      role: user.role,
      tenantId: user.tenantId,
      userId: user.id
    };

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid bearer token", undefined, "UNAUTHORIZED"));
  }
}
