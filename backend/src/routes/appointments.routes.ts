import { Router } from "express";
import { appointmentsController } from "../controllers/appointments.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAppointmentSchema, statusUpdateSchema, vetPatientsSchema } from "../schemas/appointments.schemas";

export const appointmentsRouter = Router();

appointmentsRouter.post("/appointments", requireAuth, validate(createAppointmentSchema), appointmentsController.create);
appointmentsRouter.get("/appointments/my", requireAuth, appointmentsController.my);
appointmentsRouter.patch(
  "/appointments/:id/status",
  requireAuth,
  requireRole("admin", "jefe", "veterinario", "recepcionista", "asistente"),
  validate(statusUpdateSchema),
  appointmentsController.updateStatus
);
appointmentsRouter.get("/appointments/vet/:vetId/patients", requireAuth, validate(vetPatientsSchema), appointmentsController.vetPatients);
