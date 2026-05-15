import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { remindersService } from "../services/reminders.service";

export const remindersController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    // Inyectar userId del token — nunca del body del cliente
    const data = await remindersService.create({ ...req.body, userId: uid });
    res.status(201).json({ data });
  },

  listByPet: async (req: Request, res: Response): Promise<void> => {
    const petId = String(req.params.petId);
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    // Admins y veterinarios pueden ver reminders de sus pacientes
    // Usuarios solo ven los de sus propias mascotas (verificado por petId scope)
    const data = await remindersService.listByPet(petId, uid, role ?? "usuario");
    res.status(200).json({ data });
  },

  patch: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    const reminder = await remindersService.getById(id);
    if (!reminder) throw new ApiError(404, "NOT_FOUND", "Reminder not found");

    const isOwner = reminder.userId === uid;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "No tienes permisos para modificar este recordatorio");
    }

    const data = await remindersService.update(id, req.body);
    res.status(200).json({ data });
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    const reminder = await remindersService.getById(id);
    if (!reminder) throw new ApiError(404, "NOT_FOUND", "Reminder not found");

    const isOwner = reminder.userId === uid;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "No tienes permisos para eliminar este recordatorio");
    }

    await remindersService.remove(id);
    res.status(200).json({ data: { deleted: true } });
  },

  addDoseRecord: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    const reminder = await remindersService.getById(id);
    if (!reminder) throw new ApiError(404, "NOT_FOUND", "Reminder not found");

    const isOwner = reminder.userId === uid;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "No tienes permisos para registrar dosis en este recordatorio");
    }

    const data = await remindersService.addDoseRecord(id, req.body);
    res.status(201).json({ data });
  },

  listDoseRecords: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const uid = req.user?.uid;
    const role = req.user?.role;
    if (!uid) throw new ApiError(401, "UNAUTHORIZED", "Authentication required");

    const reminder = await remindersService.getById(id);
    if (!reminder) throw new ApiError(404, "NOT_FOUND", "Reminder not found");

    const isOwner = reminder.userId === uid;
    const isAdmin = role === "admin";
    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "FORBIDDEN", "No tienes permisos para ver los registros de dosis");
    }

    const data = await remindersService.listDoseRecords(id);
    res.status(200).json({ data });
  }
};
