import { createHash, randomBytes, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prismaClient.js";
import { ApiError } from "../errors/ApiError.js";

// Access tokens are short-lived JWTs. Refresh tokens are opaque 64-byte random values: they are returned to the
// client once and only their SHA-256 hash is stored, so JWT_REFRESH_SECRET is not needed to sign or verify them.
// Each login starts a token "family" (a session); every refresh rotates the token inside that family.

type TokenSubject = {
  id: string;
  role: string;
  tenantId: string;
};

export type RefreshTokenContext = {
  deviceName?: string;
  ip?: string;
  userAgent?: string;
};

export type IssuedTokenPair = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

const REFRESH_TOKEN_BYTES = 64;
const DAY_MS = 24 * 60 * 60 * 1000;

export function hashRefreshToken(refreshToken: string) {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export function signAccessToken(user: TokenSubject) {
  const accessToken = jwt.sign(
    {
      role: user.role,
      tenantId: user.tenantId
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"],
      subject: user.id
    }
  );
  const { exp } = jwt.decode(accessToken) as jwt.JwtPayload;

  return {
    accessToken,
    accessTokenExpiresAt: new Date((exp ?? 0) * 1000).toISOString()
  };
}

export async function issueTokenPair(
  user: TokenSubject,
  context: RefreshTokenContext = {},
  familyId: string = randomUUID()
): Promise<IssuedTokenPair & { refreshTokenId: string }> {
  const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * DAY_MS);
  const record = await prisma.refreshToken.create({
    data: {
      deviceName: context.deviceName,
      expiresAt,
      familyId,
      ip: context.ip,
      tokenHash: hashRefreshToken(refreshToken),
      userAgent: context.userAgent,
      userId: user.id
    },
    select: {
      id: true
    }
  });

  return {
    ...signAccessToken(user),
    refreshToken,
    refreshTokenExpiresAt: expiresAt.toISOString(),
    refreshTokenId: record.id
  };
}

export async function rotateRefreshToken(refreshToken: string, context: RefreshTokenContext = {}) {
  const now = new Date();
  const existing = await prisma.refreshToken.findUnique({
    include: {
      user: {
        select: {
          id: true,
          isActive: true,
          role: true,
          tenantId: true
        }
      }
    },
    where: {
      tokenHash: hashRefreshToken(refreshToken)
    }
  });

  if (!existing) {
    throw new ApiError(401, "Invalid refresh token", undefined, "INVALID_REFRESH_TOKEN");
  }

  if (existing.revokedAt) {
    await revokeFamily(existing.familyId, now);
    throw new ApiError(401, "Refresh token reuse detected", undefined, "REFRESH_TOKEN_REUSED");
  }

  if (existing.expiresAt <= now) {
    throw new ApiError(401, "Refresh token has expired", undefined, "REFRESH_TOKEN_EXPIRED");
  }

  if (!existing.user.isActive) {
    await revokeAllForUser(existing.userId, now);
    throw new ApiError(401, "User account is inactive", undefined, "USER_INACTIVE");
  }

  // Claim the token atomically so two concurrent refreshes with the same token cannot both succeed.
  const claimed = await prisma.refreshToken.updateMany({
    data: {
      lastUsedAt: now,
      revokedAt: now
    },
    where: {
      id: existing.id,
      revokedAt: null
    }
  });

  if (claimed.count === 0) {
    await revokeFamily(existing.familyId, now);
    throw new ApiError(401, "Refresh token reuse detected", undefined, "REFRESH_TOKEN_REUSED");
  }

  const issued = await issueTokenPair(
    existing.user,
    {
      deviceName: context.deviceName ?? existing.deviceName ?? undefined,
      ip: context.ip,
      userAgent: context.userAgent ?? existing.userAgent ?? undefined
    },
    existing.familyId
  );

  await prisma.refreshToken.update({
    data: {
      replacedById: issued.refreshTokenId
    },
    where: {
      id: existing.id
    }
  });

  return {
    tokens: toPublicTokenPair(issued),
    userId: existing.userId
  };
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    data: {
      revokedAt: new Date()
    },
    where: {
      revokedAt: null,
      tokenHash: hashRefreshToken(refreshToken)
    }
  });
}

export async function revokeAllForUser(userId: string, revokedAt = new Date()) {
  const result = await prisma.refreshToken.updateMany({
    data: {
      revokedAt
    },
    where: {
      revokedAt: null,
      userId
    }
  });

  return result.count;
}

export async function listActiveSessions(userId: string) {
  const now = new Date();
  const activeTokens = await prisma.refreshToken.findMany({
    orderBy: {
      createdAt: "desc"
    },
    select: {
      createdAt: true,
      deviceName: true,
      familyId: true,
      lastUsedAt: true,
      userAgent: true
    },
    where: {
      expiresAt: {
        gt: now
      },
      revokedAt: null,
      userId
    }
  });

  if (activeTokens.length === 0) {
    return [];
  }

  // A session is a token family; its start time is the oldest token still stored for that family.
  const familyStarts = await prisma.refreshToken.groupBy({
    _min: {
      createdAt: true
    },
    by: ["familyId"],
    where: {
      familyId: {
        in: activeTokens.map((token) => token.familyId)
      },
      userId
    }
  });
  const startedAtByFamily = new Map(familyStarts.map((family) => [family.familyId, family._min.createdAt]));

  return activeTokens.map((token) => ({
    createdAt: startedAtByFamily.get(token.familyId) ?? token.createdAt,
    deviceName: token.deviceName,
    id: token.familyId,
    lastUsedAt: token.lastUsedAt ?? token.createdAt,
    userAgent: token.userAgent
  }));
}

export async function revokeSession(userId: string, sessionId: string) {
  const result = await prisma.refreshToken.updateMany({
    data: {
      revokedAt: new Date()
    },
    where: {
      expiresAt: {
        gt: new Date()
      },
      familyId: sessionId,
      revokedAt: null,
      userId
    }
  });

  if (result.count === 0) {
    throw new ApiError(404, "Session not found", undefined, "SESSION_NOT_FOUND");
  }
}

export async function deleteExpiredRefreshTokens(now = new Date()) {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: now
      }
    }
  });

  return result.count;
}

export function toPublicTokenPair(tokens: IssuedTokenPair): IssuedTokenPair {
  return {
    accessToken: tokens.accessToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt
  };
}

async function revokeFamily(familyId: string, revokedAt: Date) {
  await prisma.refreshToken.updateMany({
    data: {
      revokedAt
    },
    where: {
      familyId,
      revokedAt: null
    }
  });
}
