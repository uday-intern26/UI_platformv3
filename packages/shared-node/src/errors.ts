import type { ErrorBody } from "./types.js";

export function errorResponse(
  code: string,
  message: string,
  correlationId?: string,
  details?: unknown,
): ErrorBody {
  return {
    error: { code, message, correlationId, details },
  };
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
