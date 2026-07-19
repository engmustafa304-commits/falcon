import { performance } from "node:perf_hooks";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  if (env.NODE_ENV === "test") {
    next();
    return;
  }

  response.on("finish", () => {
    const durationMs = getRequestDuration(response);

    console.info(JSON.stringify({
      durationMs,
      method: request.method,
      path: request.originalUrl,
      requestId: response.locals.requestId,
      status: response.statusCode
    }));
  });

  next();
}

export function getRequestDuration(response: Response) {
  const startedAt = response.locals.requestStartedAt;

  if (typeof startedAt !== "number") {
    return undefined;
  }

  return Math.round((performance.now() - startedAt) * 100) / 100;
}
