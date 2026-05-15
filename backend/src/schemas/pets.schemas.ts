import { z } from "zod";

export const createPetSchema = z.object({
  body: z.object({
    usaVeterinaria: z.boolean(),
    vetId: z.string().min(3).nullable().optional(),
    clinicId: z.string().min(3).nullable().optional(),
    nombre: z.string().min(1),
    especie: z.string().min(1),
    raza: z.string().min(1),
    sexo: z.string().min(1),
    fechaNacimiento: z.string().datetime().nullable().optional(),
    alergias: z.string().nullable().optional(),
    condicionesCronicas: z.string().nullable().optional(),
    fotoUrl: z.string().url().max(2048).nullable().optional()
  }).superRefine((body, ctx) => {
    if (body.usaVeterinaria && !body.vetId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "vetId is required when usaVeterinaria=true", path: ["vetId"] });
    }
  }),
  params: z.object({}),
  query: z.object({})
});

export const petIdParamSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});

export const assignVetSchema = z.object({
  body: z.object({ vetId: z.string().min(3), clinicId: z.string().min(3).nullable().optional() }),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});
