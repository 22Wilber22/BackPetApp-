import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { reportsController } from "../controllers/reports.controller";

export const reportsRouter = Router();

reportsRouter.get("/reports/appointments", requireAuth, reportsController.appointments);
reportsRouter.get("/reports/patients", requireAuth, reportsController.patients);
