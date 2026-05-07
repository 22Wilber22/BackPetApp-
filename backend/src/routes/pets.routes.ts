import { Router } from "express";
import { petsController } from "../controllers/pets.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { sensitiveRateLimit } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { assignVetSchema, createPetSchema, petIdParamSchema } from "../schemas/pets.schemas";

export const petsRouter = Router();

petsRouter.post("/pets", requireAuth, sensitiveRateLimit, validate(createPetSchema), petsController.create);
petsRouter.get("/pets/my", requireAuth, petsController.listMine);
petsRouter.get("/pets/my/archived", requireAuth, petsController.listArchived);
petsRouter.patch("/pets/:id/deactivate", requireAuth, validate(petIdParamSchema), petsController.deactivate);
petsRouter.patch("/pets/:id/reactivate", requireAuth, validate(petIdParamSchema), petsController.reactivate);
petsRouter.get("/pets/:id", requireAuth, validate(petIdParamSchema), petsController.getById);
petsRouter.patch("/pets/:id/assign-vet", requireAuth, validate(assignVetSchema), petsController.assignVet);
petsRouter.patch("/pets/:id/unassign-vet", requireAuth, validate(petIdParamSchema), petsController.unassignVet);

petsRouter.post("/pets/:id/health-records", requireAuth, petsController.createHealthRecord);
petsRouter.get("/pets/:id/health-records", requireAuth, petsController.listHealthRecords);
petsRouter.post("/pets/:id/health-records/:recordId/revisions", requireAuth, petsController.addHealthRecordRevision);
petsRouter.patch("/pets/:id/health-records/:recordId/archive", requireAuth, requireRole("admin"), petsController.archiveHealthRecord);
petsRouter.get("/pets/:id/last-weight", requireAuth, petsController.lastWeight);

petsRouter.post("/pets/:id/events", requireAuth, petsController.createEvent);
petsRouter.get("/pets/:id/events", requireAuth, petsController.listEvents);
petsRouter.get("/pets/:id/events/timeline", requireAuth, petsController.timelineEvents);

petsRouter.post("/pets/:id/medications", requireAuth, petsController.createMedication);
petsRouter.get("/pets/:id/medications", requireAuth, petsController.listMedications);
petsRouter.patch("/pets/:id/medications/:medId", requireAuth, petsController.patchMedication);
petsRouter.patch("/pets/:id/medications/:medId/deactivate", requireAuth, petsController.deactivateMedication);
petsRouter.post("/pets/:id/medications/:medId/logs", requireAuth, petsController.addMedicationLog);
petsRouter.get("/pets/:id/medications/:medId/logs", requireAuth, petsController.listMedicationLogs);
petsRouter.get("/pets/:id/medications/due", requireAuth, petsController.dueMedications);
