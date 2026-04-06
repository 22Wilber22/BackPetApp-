import { z } from "zod";

const roleEnum = z.enum(["admin", "jefe", "veterinario", "recepcionista", "asistente", "usuario"]);

export const patchMeSchema = z.object({
  body: z.object({
    nombres: z.string().min(2).optional(),
    apellidos: z.string().min(2).optional(),
    telefono: z.string().min(7).max(30).nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const patchRoleSchema = z.object({
  body: z.object({ role: roleEnum, clinicId: z.string().min(3).nullable().optional() }),
  params: z.object({ uid: z.string().min(3) }),
  query: z.object({})
});

export const assignAssistantSchema = z.object({
  body: z.object({ supervisorVetId: z.string().min(3) }),
  params: z.object({ uid: z.string().min(3) }),
  query: z.object({})
});
