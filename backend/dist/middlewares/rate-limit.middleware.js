"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseBurstGuard = exports.sensitiveRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_error_1 = require("../utils/api-error");
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, code: "RATE_LIMITED", message: "Too many auth requests, try again later" }
});
exports.sensitiveRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, code: "RATE_LIMITED", message: "Too many requests, try again later" }
});
const MAX_CONCURRENT_DB_REQUESTS = 10;
let activeDbRequests = 0;
const databaseBurstGuard = (req, _res, next) => {
    if (activeDbRequests >= MAX_CONCURRENT_DB_REQUESTS) {
        next(new api_error_1.ApiError(429, "TOO_MANY_CONCURRENT_REQUESTS", "Hay demasiadas peticiones simultáneas. Espera un momento y vuelve a intentarlo."));
        return;
    }
    activeDbRequests += 1;
    let released = false;
    const release = () => {
        if (released) {
            return;
        }
        released = true;
        activeDbRequests = Math.max(0, activeDbRequests - 1);
    };
    req.res?.once("finish", release);
    req.res?.once("close", release);
    next();
};
exports.databaseBurstGuard = databaseBurstGuard;
