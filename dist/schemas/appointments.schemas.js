"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vetPatientsSchema = exports.statusUpdateSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        ownerId: zod_1.z.string().min(3).optional(),
        petId: zod_1.z.string().min(3),
        petName: zod_1.z.string().min(1).optional(),
        ownerName: zod_1.z.string().min(1).optional(),
        vetName: zod_1.z.string().min(1).optional(),
        vetId: zod_1.z.string().min(3).optional(),
        assistantIds: zod_1.z.array(zod_1.z.string()).default([]),
        clinicId: zod_1.z.string().min(3).optional(),
        type: zod_1.z.string().min(1),
        schedule: zod_1.z.string().datetime(),
        reason: zod_1.z.string().min(1),
        symptoms: zod_1.z.string().nullable().optional(),
        notes: zod_1.z.string().nullable().optional(),
        channel: zod_1.z.string().nullable().optional(),
        sendReminder: zod_1.z.boolean().default(false)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.statusUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({ status: zod_1.z.enum(["pending", "confirmed", "completed", "cancelled"]) }),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
exports.vetPatientsSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({ vetId: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
