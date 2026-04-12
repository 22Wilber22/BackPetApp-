"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.petIdSchema = exports.reminderIdSchema = exports.createReminderSchema = void 0;
const zod_1 = require("zod");
exports.createReminderSchema = zod_1.z.object({
    body: zod_1.z.object({
        petId: zod_1.z.string().min(3),
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().nullable().optional(),
        frequency: zod_1.z.string().min(1),
        customHours: zod_1.z.number().nullable().optional(),
        startDate: zod_1.z.string().datetime(),
        endDate: zod_1.z.string().datetime().nullable().optional(),
        dosesCompleted: zod_1.z.number().int().min(0).default(0),
        status: zod_1.z.string().default("active"),
        extendedUntil: zod_1.z.string().datetime().nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.reminderIdSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
exports.petIdSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({ petId: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
