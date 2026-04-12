import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireClinicContext } from "../middlewares/clinic-scope.middleware";
import { patientsController } from "../controllers/patients.controller";

export const patientsRouter = Router();

patientsRouter.get("/patients", requireAuth, requireClinicContext, patientsController.list);
patientsRouter.get("/patients/:petId", requireAuth, requireClinicContext, patientsController.getById);
patientsRouter.post("/patients/:petId/history", requireAuth, requireClinicContext, patientsController.addHistory);
patientsRouter.get("/patients/:petId/history", requireAuth, requireClinicContext, patientsController.listHistory);
patientsRouter.post("/patients/:petId/history/:recordId/revisions", requireAuth, requireClinicContext, patientsController.addHistoryRevision);
patientsRouter.post("/patients/:petId/treatments", requireAuth, requireClinicContext, patientsController.createTreatment);
patientsRouter.patch("/patients/:petId/treatments/:id", requireAuth, requireClinicContext, patientsController.patchTreatment);
patientsRouter.get("/patients/:petId/treatments", requireAuth, requireClinicContext, patientsController.listTreatments);
