import { Request, Response } from "express";

export const healthController = {
  check: (_req: Request, res: Response): void => {
    res.status(200).json({ ok: true, service: "petapp-backend", timestamp: new Date().toISOString() });
  }
};
