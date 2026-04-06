"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicIdParamSchema = exports.createClinicSchema = void 0;
const zod_1 = require("zod");
exports.createClinicSchema = zod_1.z.object({
    body: zod_1.z.object({
        jefeId: zod_1.z.string().min(3),
        nombre: zod_1.z.string().min(2),
        direccion: zod_1.z.string().min(3),
        ciudad: zod_1.z.string().min(2),
        telefono: zod_1.z.string().min(7),
        geo: zod_1.z.object({ lat: zod_1.z.number(), lng: zod_1.z.number() }).nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.clinicIdParamSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
