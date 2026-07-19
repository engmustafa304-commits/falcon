import type { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        role: UserRole;
        tenantId: string;
        userId: string;
      };
    }
  }
}

export {};
