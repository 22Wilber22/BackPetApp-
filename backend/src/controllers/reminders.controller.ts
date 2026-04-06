import { Request, Response } from "express";
import { remindersService } from "../services/reminders.service";

export const remindersController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const data = await remindersService.create(req.body);
    res.status(201).json({ data });
  },

  listByPet: async (req: Request, res: Response): Promise<void> => {
    const petId = String(req.params.petId);
    const data = await remindersService.listByPet(petId);
    res.status(200).json({ data });
  },

  patch: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const data = await remindersService.update(id, req.body);
    res.status(200).json({ data });
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    await remindersService.remove(id);
    res.status(200).json({ data: { deleted: true } });
  },

  addDoseRecord: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const data = await remindersService.addDoseRecord(id, req.body);
    res.status(201).json({ data });
  },

  listDoseRecords: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const data = await remindersService.listDoseRecords(id);
    res.status(200).json({ data });
  }
};
