import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireClinicContext } from "../middlewares/clinic-scope.middleware";
import { staffController } from "../controllers/staff.controller";

export const staffRouter = Router();

staffRouter.get("/staff", requireAuth, requireClinicContext, staffController.listTeam);
staffRouter.get("/staff/:uid/patients", requireAuth, requireClinicContext, staffController.patientsByVet);
