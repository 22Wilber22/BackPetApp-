import { z } from "zod";

export const createReminderSchema = z.object({
  body: z.object({
    petId: z.string().min(3),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    frequency: z.string().min(1),
    customHours: z.number().nullable().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().nullable().optional(),
    dosesCompleted: z.number().int().min(0).default(0),
    status: z.string().default("active"),
    extendedUntil: z.string().datetime().nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const reminderIdSchema = z.object({
  body: z.object({}),
  params: z.object({ id: z.string().min(3) }),
  query: z.object({})
});

export const petIdSchema = z.object({
  body: z.object({}),
  params: z.object({ petId: z.string().min(3) }),
  query: z.object({})
});
