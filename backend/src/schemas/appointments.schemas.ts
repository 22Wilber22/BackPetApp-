import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    ownerId: z.string().min(3).optional(),
    petId: z.string().min(3),
    petName: z.string().min(1).optional(),
    ownerName: z.string().min(1).optional(),
    vetName: z.string().min(1).optional(),
    vetId: z.string().min(3).optional(),
    assistantIds: z.array(z.string()).default([]),
    clinicId: z.string().min(3).optional(),
    type: z.string().min(1),
    schedule: z.string().datetime(),
    reason: z.string().min(1),
    symptoms: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    channel: z.string().nullable().optional(),
    sendReminder: z.boolean().default(false)
  }),
  params: z.object({}),
  query: z.object({})
});

export const statusUpdateSchema = z.object({
  body: z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) }),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});

export const vetPatientsSchema = z.object({
  body: z.object({}),
  params: z.object({ vetId: z.string().min(3) }),
  query: z.object({})
});
