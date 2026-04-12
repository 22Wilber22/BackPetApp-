import { Router } from "express";
import { clinicsController } from "../controllers/clinics.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createClinicSchema } from "../schemas/clinics.schemas";

export const clinicsRouter = Router();

clinicsRouter.post("/clinics", requireAuth, requireRole("admin"), validate(createClinicSchema), clinicsController.create);
clinicsRouter.get("/clinics", requireAuth, requireRole("admin", "jefe", "veterinario", "recepcionista", "asistente"), clinicsController.list);
clinicsRouter.patch("/clinics/:id", requireAuth, requireRole("admin", "jefe"), clinicsController.update);
