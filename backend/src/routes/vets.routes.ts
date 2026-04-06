import { Router } from "express";
import { vetsController } from "../controllers/vets.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addAssistantSchema, createVetSchema } from "../schemas/vets.schemas";

export const vetsRouter = Router();

vetsRouter.post("/vets", requireAuth, requireRole("admin", "jefe"), validate(createVetSchema), vetsController.create);
vetsRouter.get("/vets", requireAuth, requireRole("admin", "jefe", "veterinario", "recepcionista", "asistente"), vetsController.list);
vetsRouter.patch("/vets/:id", requireAuth, requireRole("admin", "jefe"), vetsController.update);
vetsRouter.post("/vets/:id/assistants", requireAuth, requireRole("admin", "jefe"), validate(addAssistantSchema), vetsController.addAssistant);
vetsRouter.delete("/vets/:id/assistants/:assistantUserId", requireAuth, requireRole("admin", "jefe"), vetsController.removeAssistant);
