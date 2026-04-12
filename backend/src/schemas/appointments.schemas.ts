import { z } from "zod";

const optionalId = () =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(3).optional()
  );

const normalizeSchedule = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const ddmmyyyyWithTime = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[T\s]+(.+))?$/);
  if (ddmmyyyyWithTime) {
    const [, dd, mm, yyyy, rawTime] = ddmmyyyyWithTime;
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return "";
    }

    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    const timePart = (rawTime ?? "").trim();

    if (timePart) {
      const time12h = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
      const time24h = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

      if (time12h) {
        const rawHour = Number(time12h[1]);
        minutes = Number(time12h[2]);
        seconds = Number(time12h[3] ?? "0");
        const meridiem = time12h[4].toUpperCase();
        if (rawHour < 1 || rawHour > 12 || minutes > 59 || seconds > 59) {
          return "";
        }
        hours = rawHour % 12;
        if (meridiem === "PM") {
          hours += 12;
        }
      } else if (time24h) {
        hours = Number(time24h[1]);
        minutes = Number(time24h[2]);
        seconds = Number(time24h[3] ?? "0");
        if (hours > 23 || minutes > 59 || seconds > 59) {
          return "";
        }
      } else {
        return "";
      }
    }

    const localDate = new Date(year, month - 1, day, hours, minutes, seconds, 0);
    if (Number.isNaN(localDate.getTime())) {
      return "";
    }
    return localDate.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed) ? `${trimmed}:00` : trimmed;
  const parsed = Date.parse(withSeconds);
  if (Number.isNaN(parsed)) {
    return "";
  }

  return new Date(parsed).toISOString();
};

const createAppointmentBodySchema = z
  .object({
    ownerId: optionalId(),
    petId: z.string().min(3),
    petName: z.string().min(1).optional(),
    ownerName: z.string().min(1).optional(),
    vetName: z.string().min(1).optional(),
    vetId: optionalId(),
    assistantIds: z.array(z.string()).default([]),
    clinicId: optionalId(),
    type: z.string().min(1).optional(),
    schedule: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    time: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
    motivoConsulta: z.string().min(1).optional(),
    symptoms: z.string().nullable().optional(),
    sintomas: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    notas: z.string().nullable().optional(),
    channel: z.string().nullable().optional(),
    canal: z.string().nullable().optional(),
    reminderChannel: z.string().nullable().optional(),
    sendReminder: z.boolean().optional(),
    enviarRecordatorio: z.boolean().optional()
  })
  .superRefine((body, ctx) => {
    const finalReason = body.reason ?? body.motivoConsulta;
    if (!finalReason || !finalReason.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "reason is required"
      });
    }

    const rawSchedule = body.schedule ?? (body.date && body.time ? `${body.date}T${body.time}` : body.date ?? "");
    if (!normalizeSchedule(rawSchedule)) {
      ctx.addIssue({
        code: "custom",
        path: ["schedule"],
        message: "schedule must be a valid date/time"
      });
    }
  })
  .transform((body) => {
    const rawSchedule = body.schedule ?? (body.date && body.time ? `${body.date}T${body.time}` : body.date ?? "");

    return {
      ownerId: body.ownerId,
      petId: body.petId,
      petName: body.petName,
      ownerName: body.ownerName,
      vetName: body.vetName,
      vetId: body.vetId,
      assistantIds: body.assistantIds,
      clinicId: body.clinicId,
      type: body.type ?? "consulta",
      schedule: normalizeSchedule(rawSchedule),
      reason: (body.reason ?? body.motivoConsulta ?? "").trim(),
      symptoms: body.symptoms ?? body.sintomas ?? null,
      notes: body.notes ?? body.notas ?? null,
      channel: body.channel ?? body.reminderChannel ?? body.canal ?? null,
      sendReminder: body.sendReminder ?? body.enviarRecordatorio ?? false
    };
  });

export const createAppointmentSchema = z.object({
  body: createAppointmentBodySchema,
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
