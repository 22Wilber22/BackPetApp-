import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { UserRole } from "../models/user.model";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role as UserRole | undefined;

    if (!role || !allowedRoles.includes(role)) {
      next(new ApiError(403, "FORBIDDEN", "Insufficient permissions"));
      return;
    }

    next();
  };
};
