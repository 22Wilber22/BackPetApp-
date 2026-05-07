import { Request, Response } from "express";
import { remindersService } from "../services/reminders.service";
import { petsService } from "../services/pets.service";
import { ApiError } from "../utils/api-error";

const assertPetOwnership = async (petId: string, uid: string | undefined, role: string | undefined): Promise<void> => {
  if (!uid) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }
  const pet = await petsService.getById(petId);
  if (!pet) {
    throw new ApiError(404, "PET_NOT_FOUND", "Pet not found");
  }
  const isOwner = pet.ownerId === uid;
  const isAdmin = role === "admin";
  const isAssignedVet = role === "veterinario" && pet.vetId === uid;
  if (!(isOwner || isAdmin || isAssignedVet)) {
    throw new ApiError(403, "FORBIDDEN", "No access to this pet's reminders");
  }
};

const assertReminderAccess = async (reminderId: string, uid: string | undefined, role: string | undefined): Promise<void> => {
  const reminder = await remindersService.getById(reminderId);
  if (!reminder) {
    throw new ApiError(404, "REMINDER_NOT_FOUND", "Reminder not found");
  }
  await assertPetOwnership(String(reminder.petId), uid, role);
};

export const remindersController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const petId = String(req.body?.petId ?? "");
    await assertPetOwnership(petId, req.user?.uid, req.user?.role);
    const data = await remindersService.create(req.body);
    res.status(201).json({ data });
  },

  listMine: async (req: Request, res: Response): Promise<void> => {
    const uid = req.user?.uid;
    if (!uid) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const pets = await petsService.listByOwner(uid);
    const petIds = pets.map((pet) => pet.id);
    const data = await remindersService.listByPetIds(petIds);
    res.status(200).json({ data });
  },

  listByPet: async (req: Request, res: Response): Promise<void> => {
    const petId = String(req.params.petId);
    await assertPetOwnership(petId, req.user?.uid, req.user?.role);
    const data = await remindersService.listByPet(petId);
    res.status(200).json({ data });
  },

  patch: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    await assertReminderAccess(id, req.user?.uid, req.user?.role);
    const data = await remindersService.update(id, req.body);
    res.status(200).json({ data });
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    await assertReminderAccess(id, req.user?.uid, req.user?.role);
    await remindersService.remove(id);
    res.status(200).json({ data: { deleted: true } });
  },

  addDoseRecord: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    await assertReminderAccess(id, req.user?.uid, req.user?.role);
    const data = await remindersService.addDoseRecord(id, req.body);
    res.status(201).json({ data });
  },

  listDoseRecords: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    await assertReminderAccess(id, req.user?.uid, req.user?.role);
    const data = await remindersService.listDoseRecords(id);
    res.status(200).json({ data });
  }
};
