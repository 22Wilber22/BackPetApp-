import { z } from "zod";

export const createVetSchema = z.object({
  body: z.object({
    userId: z.string().min(3),
    nombres: z.string().min(2),
    apellidos: z.string().min(2),
    especialidad: z.string().min(2),
    licencia: z.string().min(2),
    clinicId: z.string().min(2),
    telefono: z.string().min(7),
    email: z.string().email()
  }),
  params: z.object({}),
  query: z.object({})
});

export const vetIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(3), assistantUserId: z.string().min(3).optional() }),
  query: z.object({})
});

export const addAssistantSchema = z.object({
  body: z.object({ assistantUserId: z.string().min(3) }),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});
