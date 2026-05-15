import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodTypeAny) => (req: Request, _res: Response, next: NextFunction): void => {
  const parsed = schema.safeParse({
    body: req.body ?? {},   // GET requests have no body — default to {} so z.object({}) passes
    params: req.params,
    query: req.query
  });

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue: z.core.$ZodIssue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
    next({ statusCode: 400, code: "VALIDATION_ERROR", message: "Invalid request payload", details });
    return;
  }

  const data = parsed.data as { body: unknown; params: Request["params"]; query: Request["query"] };

  // Avoid mutating req fields directly because some Express properties can be getter-only
  // depending on runtime/parser settings.
  (req as Request & { validated?: { body: unknown; params: Request["params"]; query: Request["query"] } }).validated = data;
  next();
};
