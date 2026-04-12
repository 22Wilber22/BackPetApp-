import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { reportsService } from "../services/reports.service";

const ensureRole = (req: Request): "admin" | "jefe" => {
  const role = req.user?.role;
  if (role !== "admin" && role !== "jefe") {
    throw new ApiError(403, "FORBIDDEN", "Only admin/jefe can access reports");
  }
  return role;
};

export const reportsController = {
  appointments: async (req: Request, res: Response): Promise<void> => {
    const role = ensureRole(req);
    const clinicId = role === "admin"
      ? (req.query.clinicId as string | undefined) ?? null
      : req.user?.clinicId ?? null;

    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const data = await reportsService.appointmentsByPeriod(clinicId, from, to);
    res.status(200).json({ data });
  },

  patients: async (req: Request, res: Response): Promise<void> => {
    const role = ensureRole(req);
    const clinicId = role === "admin"
      ? (req.query.clinicId as string | undefined) ?? null
      : req.user?.clinicId ?? null;

    const data = await reportsService.patientsSummaryByVet(clinicId);
    res.status(200).json({ data });
  }
};
