import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";

export function requireSuperAdmin(request: Request, _response: Response, next: NextFunction) {
  if (request.auth?.role !== "SUPER_ADMIN") {
    next(new ApiError(403, "Super admin access is required", undefined, "SUPER_ADMIN_REQUIRED"));
    return;
  }

  next();
}
