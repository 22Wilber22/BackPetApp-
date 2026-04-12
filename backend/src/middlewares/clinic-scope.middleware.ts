import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

const tenantRoles = new Set(["jefe", "veterinario", "recepcionista", "asistente"]);

export const requireClinicContext = (req: Request, _res: Response, next: NextFunction): void => {
  const role = req.user?.role;
  if (!role) {
    next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  if (tenantRoles.has(role) && !req.user?.clinicId) {
    next(new ApiError(403, "FORBIDDEN", "Missing clinic context for tenant role"));
    return;
  }

  next();
};
