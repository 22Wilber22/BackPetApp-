"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAssistantSchema = exports.vetIdParamSchema = exports.createVetSchema = void 0;
const zod_1 = require("zod");
exports.createVetSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(3),
        nombres: zod_1.z.string().min(2),
        apellidos: zod_1.z.string().min(2),
        especialidad: zod_1.z.string().min(2),
        licencia: zod_1.z.string().min(2),
        clinicId: zod_1.z.string().min(2),
        telefono: zod_1.z.string().min(7),
        email: zod_1.z.string().email()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.vetIdParamSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({ id: zod_1.z.string().min(3), assistantUserId: zod_1.z.string().min(3).optional() }),
    query: zod_1.z.object({})
});
exports.addAssistantSchema = zod_1.z.object({
    body: zod_1.z.object({ assistantUserId: zod_1.z.string().min(3) }),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
