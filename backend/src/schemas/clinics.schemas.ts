import { z } from "zod";

export const createClinicSchema = z.object({
  body: z.object({
    jefeId: z.string().min(3),
    nombre: z.string().min(2),
    direccion: z.string().min(3),
    ciudad: z.string().min(2),
    telefono: z.string().min(7),
    geo: z.object({ lat: z.number(), lng: z.number() }).nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const clinicIdParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});
