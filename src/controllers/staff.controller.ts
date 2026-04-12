import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { staffService } from "../services/staff.service";

export const staffController = {
  listTeam: async (req: Request, res: Response): Promise<void> => {
    const role = req.user?.role;

    if (!(role === "admin" || role === "jefe")) {
      throw new ApiError(403, "FORBIDDEN", "Only admin/jefe can list staff team");
    }

    const clinicId = req.user?.clinicId ?? null;
    if (role === "jefe" && !clinicId) {
      throw new ApiError(403, "FORBIDDEN", "Jefe has no clinic assigned");
    }

    const data = role === "admin"
      ? { veterinarios: [], recepcionistas: [] }
      : await staffService.listTeamByClinic(clinicId as string);

    res.status(200).json({ data });
  },

  patientsByVet: async (req: Request, res: Response): Promise<void> => {
    const role = req.user?.role;
    const clinicId = req.user?.clinicId ?? null;

    if (!(role === "admin" || role === "jefe")) {
      throw new ApiError(403, "FORBIDDEN", "Only admin/jefe can inspect vet patients");
    }

    const vetUid = String(req.params.uid);
    const data = role === "admin"
      ? await staffService.listPatientsByVet(String(req.query.clinicId ?? ""), vetUid)
      : await staffService.listPatientsByVet(clinicId as string, vetUid);

    res.status(200).json({ data });
  }
};
