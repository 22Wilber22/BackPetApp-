"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    FRONTEND_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    FIREBASE_PROJECT_ID: zod_1.z.string().optional(),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().optional(),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional(),
    FIREBASE_DATABASE_ID: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info")
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}
exports.env = {
    ...parsed.data,
    FRONTEND_ORIGIN_LIST: parsed.data.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
};
