import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../errors/ApiError.js";
import { getRequestDuration } from "./requestLogger.js";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof ZodError) {
    if (env.NODE_ENV !== "test") {
      console.error(JSON.stringify({
        durationMs: getRequestDuration(response),
        errorMessage: "Request validation failed",
        method: request.method,
        path: request.originalUrl,
        requestId: response.locals.requestId,
        status: 400
      }));
    }

    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        details: error.flatten(),
        message: "Request validation failed"
      }
    });
    return;
  }

  const apiError = ApiError.from(error);

  if (env.NODE_ENV !== "test") {
    console.error(JSON.stringify({
      durationMs: getRequestDuration(response),
      errorMessage: apiError.message,
      method: request.method,
      path: request.originalUrl,
      requestId: response.locals.requestId,
      status: apiError.statusCode
    }));
  }

  response.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      details: apiError.details,
      message: apiError.message
    },
    meta: {
      stack: env.NODE_ENV === "development" || env.NODE_ENV === "test" ? apiError.stack : undefined
    }
  });
};
