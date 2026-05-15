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
  // Multer LIMIT_FILE_SIZE: file sent to /uploads exceeds multer cap (60 MB)
  if ((err as any)?.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: true, code: "FILE_TOO_LARGE", message: "El archivo es demasiado grande. Máximo 60 MB por imagen." });
    return;
  }

  // express.json body-parser payload too large (JSON body exceeds express limit)
  if ((err as any)?.type === "entity.too.large" || (err as any)?.status === 413) {
    res.status(413).json({ error: true, code: "PAYLOAD_TOO_LARGE", message: "El cuerpo de la solicitud es demasiado grande. Las imágenes deben subirse por el endpoint /uploads/pet-image, no como JSON." });
    return;
  }

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
