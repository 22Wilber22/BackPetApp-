"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerLoginSchema = exports.registerEmailSchema = void 0;
const zod_1 = require("zod");
exports.registerEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        nombres: zod_1.z.string().min(2),
        apellidos: zod_1.z.string().min(2),
        telefono: zod_1.z.string().min(7).max(30).nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.providerLoginSchema = zod_1.z.object({
    body: zod_1.z.object({ idToken: zod_1.z.string().min(10) }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
