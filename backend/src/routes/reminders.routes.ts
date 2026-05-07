import { Router } from "express";
import { remindersController } from "../controllers/reminders.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createReminderSchema, petIdSchema, reminderIdSchema } from "../schemas/reminders.schemas";

export const remindersRouter = Router();

remindersRouter.post("/reminders", requireAuth, validate(createReminderSchema), remindersController.create);
remindersRouter.get("/reminders", requireAuth, remindersController.listMine);
remindersRouter.get("/reminders/my", requireAuth, remindersController.listMine);
remindersRouter.get("/reminders/pet/:petId", requireAuth, validate(petIdSchema), remindersController.listByPet);
remindersRouter.patch("/reminders/:id", requireAuth, validate(reminderIdSchema), remindersController.patch);
remindersRouter.delete("/reminders/:id", requireAuth, validate(reminderIdSchema), remindersController.remove);
remindersRouter.post("/reminders/:id/dose-records", requireAuth, validate(reminderIdSchema), remindersController.addDoseRecord);
remindersRouter.get("/reminders/:id/dose-records", requireAuth, validate(reminderIdSchema), remindersController.listDoseRecords);
