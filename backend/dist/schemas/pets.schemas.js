"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignVetSchema = exports.petIdParamSchema = exports.createPetSchema = void 0;
const zod_1 = require("zod");
exports.createPetSchema = zod_1.z.object({
    body: zod_1.z.object({
        usaVeterinaria: zod_1.z.boolean(),
        vetId: zod_1.z.string().min(3).nullable().optional(),
        clinicId: zod_1.z.string().min(3).nullable().optional(),
        nombre: zod_1.z.string().min(1),
        especie: zod_1.z.string().min(1),
        raza: zod_1.z.string().min(1),
        sexo: zod_1.z.string().min(1),
        fechaNacimiento: zod_1.z.string().datetime().nullable().optional(),
        alergias: zod_1.z.string().nullable().optional(),
        condicionesCronicas: zod_1.z.string().nullable().optional(),
        fotoUrl: zod_1.z.string().url().max(2048).nullable().optional()
    }).superRefine((body, ctx) => {
        if (body.usaVeterinaria && !body.vetId) {
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: "vetId is required when usaVeterinaria=true", path: ["vetId"] });
        }
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.petIdParamSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
exports.assignVetSchema = zod_1.z.object({
    body: zod_1.z.object({ vetId: zod_1.z.string().min(3), clinicId: zod_1.z.string().min(3).nullable().optional() }),
    params: zod_1.z.object({ id: zod_1.z.string().min(3) }),
    query: zod_1.z.object({})
});
