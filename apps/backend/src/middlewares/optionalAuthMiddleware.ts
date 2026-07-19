import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prismaClient.js";

type TokenPayload = jwt.JwtPayload & {
  role?: string;
  tenantId?: string;
};

export async function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    const userId = typeof payload.sub === "string" ? payload.sub : null;

    if (!userId) {
      next();
      return;
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

    if (user?.isActive) {
      request.auth = {
        role: user.role,
        tenantId: user.tenantId,
        userId: user.id
      };
    }
  } catch {
    // These endpoints are public; invalid optional tokens should not block submissions.
  }

  next();
}
