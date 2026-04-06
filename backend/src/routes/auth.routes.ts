import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { authRateLimit } from "../middlewares/rate-limit.middleware";
import { providerLoginSchema, registerEmailSchema } from "../schemas/auth.schemas";

export const authRouter = Router();

authRouter.post("/auth/register-email", authRateLimit, validate(registerEmailSchema), authController.registerEmail);
authRouter.post("/auth/login-email", authRateLimit, authController.loginEmail);
authRouter.post("/auth/google", authRateLimit, validate(providerLoginSchema), authController.google);
authRouter.post("/auth/apple", authRateLimit, validate(providerLoginSchema), authController.apple);
authRouter.get("/auth/me", requireAuth, authController.me);
authRouter.post("/auth/logout", requireAuth, authController.logout);
