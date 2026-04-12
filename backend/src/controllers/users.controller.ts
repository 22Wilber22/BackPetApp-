import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { usersService } from "../services/users.service";
import { authService } from "../services/auth.service";
import { vetsService } from "../services/vets.service";

export const usersController = {
  getMe: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const user = await usersService.getByUid(uid);
    res.status(200).json({ data: user });
  },

  patchMe: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const updated = await usersService.update(uid, req.body);
    res.status(200).json({ data: updated });
  },

  patchRole: async (req: Request, res: Response): Promise<void> => {
    const uid = String(req.params.uid);
    const clinicId = (req.body.clinicId as string | null | undefined) ?? undefined;
    await authService.setRole(uid, req.body.role, clinicId);
    res.status(200).json({ data: { uid, role: req.body.role, clinicId: clinicId ?? null } });
  },

  assignAssistant: async (req: Request, res: Response): Promise<void> => {
    const uid = String(req.params.uid);
    const supervisorVetId = req.body.supervisorVetId;
    const supervisorVet = await vetsService.getByUserId(supervisorVetId);

    if (!supervisorVet) {
      throw new ApiError(404, "NOT_FOUND", "Supervisor vet not found");
    }

    const updated = await usersService.update(uid, {
      role: "recepcionista",
      clinicId: supervisorVet.clinicId,
      supervisorVetId
    });

    await authService.syncClaims(uid);
    res.status(200).json({ data: updated });
  }
};
