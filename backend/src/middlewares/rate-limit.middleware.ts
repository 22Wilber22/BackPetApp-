import rateLimit from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8, // máximo 8 intentos de registro/login por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, code: "RATE_LIMITED", message: "Too many auth requests, try again later" }
});

export const sensitiveRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: true, code: "RATE_LIMITED", message: "Too many requests, try again later" }
});

const MAX_CONCURRENT_DB_REQUESTS = 10;
let activeDbRequests = 0;

export const databaseBurstGuard = (req: Request, _res: Response, next: NextFunction): void => {
  if (activeDbRequests >= MAX_CONCURRENT_DB_REQUESTS) {
    next(new ApiError(429, "TOO_MANY_CONCURRENT_REQUESTS", "Hay demasiadas peticiones simultáneas. Espera un momento y vuelve a intentarlo."));
    return;
  }

  activeDbRequests += 1;
  let released = false;

  const release = (): void => {
    if (released) {
      return;
    }
    released = true;
    activeDbRequests = Math.max(0, activeDbRequests - 1);
  };

  req.res?.once("finish", release);
  req.res?.once("close", release);
  next();
};
