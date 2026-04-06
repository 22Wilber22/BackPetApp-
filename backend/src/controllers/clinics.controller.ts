import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { clinicsService } from "../services/clinics.service";

export const clinicsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const clinic = await clinicsService.create(req.body);
    res.status(201).json({ data: clinic });
  },

  list: async (_req: Request, res: Response): Promise<void> => {
    const clinics = await clinicsService.list();
    res.status(200).json({ data: clinics });
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const clinic = await clinicsService.update(id, req.body);
    if (!clinic) {
      throw new ApiError(404, "NOT_FOUND", "Clinic not found");
    }
    res.status(200).json({ data: clinic });
  }
};
