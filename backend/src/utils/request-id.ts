import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};
