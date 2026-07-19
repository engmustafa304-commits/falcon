export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly statusCode: number;

  constructor(statusCode: number, message: string, details?: unknown, code = "API_ERROR") {
    super(message);
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }

  static from(error: unknown) {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(500, error.message, undefined, "INTERNAL_SERVER_ERROR");
    }

    return new ApiError(500, "Unexpected server error", undefined, "INTERNAL_SERVER_ERROR");
  }
}
