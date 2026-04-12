import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { authService } from "../services/auth.service";

export const authController = {
  registerEmail: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.registerWithEmail(req.body);
    res.status(201).json({ data: user });
  },

  loginEmail: async (_req: Request, _res: Response): Promise<void> => {
    throw new ApiError(400, "CLIENT_LOGIN_REQUIRED", "Use Firebase Auth login in Flutter and send ID token to backend");
  },

  google: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.upsertProviderUser(req.body.idToken);
    res.status(200).json({ data: user });
  },

  apple: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.upsertProviderUser(req.body.idToken);
    res.status(200).json({ data: user });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const user = await authService.me(req.user.uid);
    res.status(200).json({ data: user, role: req.user.role ?? user?.role ?? "usuario" });
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
    }

    await authService.logout(req.user.uid);
    res.status(200).json({ data: { revoked: true } });
  }
};
