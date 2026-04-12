import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
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
