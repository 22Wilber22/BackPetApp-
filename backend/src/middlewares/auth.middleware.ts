import { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebase";
import { ApiError } from "../utils/api-error";
import { UserRole } from "../models/user.model";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing bearer token");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const decoded = await adminAuth.verifyIdToken(token, true);
    const roleFromClaims = decoded.role as UserRole | undefined;

    req.user = {
      ...decoded,
      role: roleFromClaims ?? "usuario",
      clinicId: (decoded.clinicId as string | null | undefined) ?? null,
      supervisorVetId: (decoded.supervisorVetId as string | null | undefined) ?? null
    };
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
};
