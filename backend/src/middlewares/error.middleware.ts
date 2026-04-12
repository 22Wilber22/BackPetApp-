import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

type KnownError = {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
};

export const errorHandler = (
  err: KnownError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_ERROR";

  if (err instanceof ZodError) {
    res.status(400).json({ error: true, code: "VALIDATION_ERROR", message: err.message });
    return;
  }

  logger.error(
    {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode,
      code,
      details: err.details
    },
    err.message ?? "Unhandled error"
  );

  res.status(statusCode).json({
    error: true,
    code,
    message: err.message ?? "Unexpected server error"
  });
};
