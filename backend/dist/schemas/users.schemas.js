"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAssistantSchema = exports.patchRoleSchema = exports.patchMeSchema = void 0;
const zod_1 = require("zod");
const roleEnum = zod_1.z.enum(["admin", "jefe", "veterinario", "recepcionista", "asistente", "usuario"]);
exports.patchMeSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombres: zod_1.z.string().min(2).optional(),
        apellidos: zod_1.z.string().min(2).optional(),
        telefono: zod_1.z.string().min(7).max(30).nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.patchRoleSchema = zod_1.z.object({
    body: zod_1.z.object({ role: roleEnum, clinicId: zod_1.z.string().min(3).nullable().optional() }),
    params: zod_1.z.object({ uid: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
exports.assignAssistantSchema = zod_1.z.object({
    body: zod_1.z.object({ supervisorVetId: zod_1.z.string().min(3) }),
    params: zod_1.z.object({ uid: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
