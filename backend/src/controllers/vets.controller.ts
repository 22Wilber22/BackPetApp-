import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { vetsService } from "../services/vets.service";

export const vetsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const actorRole = req.user?.role;
    const actorClinicId = req.user?.clinicId ?? null;

    if (actorRole === "jefe") {
      if (!actorClinicId) {
        throw new ApiError(403, "FORBIDDEN", "Jefe has no clinic assigned");
      }
      if (req.body.clinicId && req.body.clinicId !== actorClinicId) {
        throw new ApiError(403, "FORBIDDEN", "Cannot create vet for another clinic");
      }
      req.body.clinicId = actorClinicId;
    }

    const vet = await vetsService.create(req.body);
    res.status(201).json({ data: vet });
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const actorRole = req.user?.role;
    const actorClinicId = req.user?.clinicId ?? null;

    const vets = actorRole === "admin"
      ? await vetsService.list()
      : actorClinicId
        ? await vetsService.listByClinic(actorClinicId)
        : [];

    res.status(200).json({ data: vets });
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const actorRole = req.user?.role;
    const actorClinicId = req.user?.clinicId ?? null;

    if (actorRole === "jefe") {
      const current = await vetsService.getByVetId(id);
      if (!current || current.clinicId !== actorClinicId) {
        throw new ApiError(403, "FORBIDDEN", "Cannot edit vet from another clinic");
      }
      if (req.body.clinicId && req.body.clinicId !== actorClinicId) {
        throw new ApiError(403, "FORBIDDEN", "Cannot move vet to another clinic");
      }
    }

    const vet = await vetsService.update(id, req.body);
    if (!vet) {
      throw new ApiError(404, "NOT_FOUND", "Vet not found");
    }
    res.status(200).json({ data: vet });
  },

  addAssistant: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const actorRole = req.user?.role;
    const actorClinicId = req.user?.clinicId ?? null;

    if (actorRole === "jefe") {
      const vet = await vetsService.getByVetId(id);
      if (!vet || vet.clinicId !== actorClinicId) {
        throw new ApiError(403, "FORBIDDEN", "Cannot manage assistants in another clinic");
      }
    }

    await vetsService.addAssistant(id, req.body.assistantUserId);
    res.status(201).json({ data: { vetId: id, assistantUserId: req.body.assistantUserId } });
  },

  removeAssistant: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const assistantUserId = String(req.params.assistantUserId);

    if (req.user?.role === "jefe") {
      const vet = await vetsService.getByVetId(id);
      if (!vet || vet.clinicId !== req.user?.clinicId) {
        throw new ApiError(403, "FORBIDDEN", "Cannot manage assistants in another clinic");
      }
    }

    await vetsService.removeAssistant(id, assistantUserId);
    res.status(200).json({ data: { removed: true } });
  }
};
