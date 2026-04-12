import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { appointmentsService } from "../services/appointments.service";
import { petsService } from "../services/pets.service";
import { usersService } from "../services/users.service";

export const appointmentsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const validatedBody = (req as Request & { validated?: { body?: Record<string, unknown> } }).validated?.body;
    const body = (validatedBody ?? req.body) as Record<string, unknown>;
    const normalizeOptionalId = (value: unknown): string => {
      if (typeof value !== "string") {
        return "";
      }
      const trimmed = value.trim();
      if (!trimmed || trimmed === "undefined" || trimmed === "null") {
        return "";
      }
      return trimmed;
    };

    const role = req.user?.role;
    const uid = req.user?.uid;
    const clinicId = req.user?.clinicId ?? null;

    if (!uid || !role) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const canCreate = ["admin", "jefe", "veterinario", "recepcionista", "asistente", "usuario"].includes(role);
    if (!canCreate) {
      throw new ApiError(403, "FORBIDDEN", "Role cannot create appointments");
    }

    const pet = await petsService.getById(String(body.petId));
    if (!pet) {
      throw new ApiError(404, "NOT_FOUND", "Pet not found");
    }

    // DEBUG LOG
    console.log(`[APPOINTMENT CREATE] User ${uid} (${role}) creating appointment for pet ${pet.id} (clinicId: ${pet.clinicId})`);

    const payload = {
      ownerId: String(body.ownerId ?? pet.ownerId),
      petId: String(body.petId),
      petName: String(body.petName ?? pet.nombre),
      ownerName: String(body.ownerName ?? ""),
      vetName: String(body.vetName ?? ""),
      vetId: normalizeOptionalId(body.vetId),
      assistantIds: (body.assistantIds as string[] | undefined) ?? [],
      clinicId: normalizeOptionalId(body.clinicId) || normalizeOptionalId(pet.clinicId),
      type: String(body.type),
      schedule: String(body.schedule),
      reason: String(body.reason),
      symptoms: (body.symptoms as string | null | undefined) ?? null,
      notes: (body.notes as string | null | undefined) ?? null,
      channel: (body.channel as string | null | undefined) ?? null,
      sendReminder: Boolean(body.sendReminder)
    };

    if (role === "usuario") {
      payload.ownerId = uid;

      // Public users are not tied to a single clinic account; infer clinic from selected vet when possible.
      if (!payload.clinicId && payload.vetId) {
        const vetUser = await usersService.getByUid(payload.vetId);
        if (vetUser?.role === "veterinario" && vetUser.clinicId) {
          payload.clinicId = vetUser.clinicId;
        }
      }
    }

    if (role === "veterinario") {
      payload.vetId = uid;
      payload.clinicId = clinicId ?? payload.clinicId;
    }

    if (role === "recepcionista" || role === "asistente") {
      if (!clinicId) {
        throw new ApiError(403, "FORBIDDEN", "Missing clinic context");
      }

      if (!payload.vetId) {
        throw new ApiError(400, "INVALID_REQUEST", "vetId is required for recepcionista scheduling");
      }

      const vetUser = await usersService.getByUid(payload.vetId);
      if (!vetUser || vetUser.role !== "veterinario" || vetUser.clinicId !== clinicId) {
        throw new ApiError(403, "FORBIDDEN", "vetId is not part of caller clinic");
      }

      payload.clinicId = clinicId;
    }

    if (role === "jefe") {
      if (!clinicId) {
        throw new ApiError(403, "FORBIDDEN", "Missing clinic context");
      }
      payload.clinicId = clinicId;
    }

    if (role !== "usuario" && !payload.vetId) {
      throw new ApiError(400, "INVALID_REQUEST", "vetId is required to create appointment");
    }

    if (!payload.clinicId && payload.vetId) {
      const vetUser = await usersService.getByUid(payload.vetId);
      if (vetUser?.clinicId) {
        payload.clinicId = vetUser.clinicId;
      }
    }

    if (!payload.clinicId && pet.clinicId) {
      payload.clinicId = pet.clinicId;
    }

    const appointment = await appointmentsService.create(payload);
    res.status(201).json({ data: appointment });
  },

  my: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const list = await appointmentsService.listByActor(
      req.user.uid,
      String(req.user.role ?? "usuario"),
      req.user.clinicId ?? null
    );
    res.status(200).json({ data: list });
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const updated = await appointmentsService.updateStatus(id, req.body.status);
    if (!updated) {
      throw new ApiError(404, "NOT_FOUND", "Appointment not found");
    }

    const role = req.user?.role;
    const uid = req.user?.uid ?? "";
    const actorClinicId = req.user?.clinicId ?? null;
    const isAssigned = updated.assistantIds.includes(uid) || updated.vetId === uid;
    const isClinicLead = (role === "jefe" || role === "recepcionista" || role === "asistente") && actorClinicId === updated.clinicId;
    if (!(role === "admin" || isAssigned || isClinicLead)) {
      throw new ApiError(403, "FORBIDDEN", "No permissions to update this appointment");
    }

    res.status(200).json({ data: updated });
  },

  vetPatients: async (req: Request, res: Response): Promise<void> => {
    const vetId = String(req.params.vetId);
    if (req.user?.role === "veterinario" && req.user.uid !== vetId) {
      throw new ApiError(403, "FORBIDDEN", "Vet can only list own patients");
    }
    const data = await appointmentsService.listVetPatients(vetId);
    res.status(200).json({ data });
  }
};
