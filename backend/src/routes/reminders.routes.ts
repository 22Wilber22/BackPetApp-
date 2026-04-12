import { Router } from "express";
import { remindersController } from "../controllers/reminders.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const remindersRouter = Router();

remindersRouter.post("/reminders", requireAuth, remindersController.create);
remindersRouter.get("/reminders/pet/:petId", requireAuth, remindersController.listByPet);
remindersRouter.patch("/reminders/:id", requireAuth, remindersController.patch);
remindersRouter.delete("/reminders/:id", requireAuth, remindersController.remove);
remindersRouter.post("/reminders/:id/dose-records", requireAuth, remindersController.addDoseRecord);
remindersRouter.get("/reminders/:id/dose-records", requireAuth, remindersController.listDoseRecords);
