import { z } from "zod";

export const registerEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    nombres: z.string().min(2),
    apellidos: z.string().min(2),
    telefono: z.string().min(7).max(30).nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const providerLoginSchema = z.object({
  body: z.object({ idToken: z.string().min(10) }),
  params: z.object({}),
  query: z.object({})
});
