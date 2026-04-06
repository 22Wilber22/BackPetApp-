import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { patientsService } from "../services/patients.service";

const getActor = (req: Request) => {
  const uid = req.user?.uid;
  const role = req.user?.role;

  if (!uid || !role) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  return {
    uid,
    role,
    clinicId: req.user?.clinicId ?? null
  };
};

export const patientsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const data = await patientsService.listByActor(actor);
    res.status(200).json({ data });
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const petId = String(req.params.petId);
    const data = await patientsService.getByIdForActor(actor, petId);
    res.status(200).json({ data });
  },

  addHistory: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const data = await patientsService.addHistoryEntry(actor, petId, req.body);
    res.status(201).json({ data });
  },

  listHistory: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const data = await patientsService.listHistory(petId);
    res.status(200).json({ data });
  },

  addHistoryRevision: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const recordId = String(req.params.recordId);
    const data = await patientsService.addHistoryRevision(actor, recordId, req.body);
    res.status(201).json({ data });
  },

  createTreatment: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    if (!(actor.role === "admin" || actor.role === "jefe" || actor.role === "veterinario")) {
      throw new ApiError(403, "FORBIDDEN", "Only clinical roles can create treatments");
    }

    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const data = await patientsService.createTreatment(actor, petId, req.body);
    res.status(201).json({ data });
  },

  patchTreatment: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    if (!(actor.role === "admin" || actor.role === "jefe" || actor.role === "veterinario")) {
      throw new ApiError(403, "FORBIDDEN", "Only clinical roles can patch treatments");
    }

    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const treatmentId = String(req.params.id);
    const data = await patientsService.patchTreatment(treatmentId, req.body);
    res.status(200).json({ data });
  },

  listTreatments: async (req: Request, res: Response): Promise<void> => {
    const actor = getActor(req);
    const petId = String(req.params.petId);
    await patientsService.getByIdForActor(actor, petId);
    const data = await patientsService.listTreatments(petId);
    res.status(200).json({ data });
  }
};
