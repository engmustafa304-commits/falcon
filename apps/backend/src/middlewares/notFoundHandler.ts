import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/ApiError.js";

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found", { path: request.originalUrl }));
}
