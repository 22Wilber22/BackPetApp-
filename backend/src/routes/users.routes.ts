import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { assignAssistantSchema, patchMeSchema, patchRoleSchema } from "../schemas/users.schemas";

export const usersRouter = Router();

usersRouter.get("/users/me", requireAuth, usersController.getMe);
usersRouter.patch("/users/me", requireAuth, validate(patchMeSchema), usersController.patchMe);
usersRouter.patch("/users/:uid/role", requireAuth, requireRole("admin"), validate(patchRoleSchema), usersController.patchRole);
usersRouter.patch("/users/:uid/assign-assistant", requireAuth, requireRole("admin"), validate(assignAssistantSchema), usersController.assignAssistant);
