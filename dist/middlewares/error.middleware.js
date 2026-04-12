"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const code = err.code ?? "INTERNAL_ERROR";
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({ error: true, code: "VALIDATION_ERROR", message: err.message });
        return;
    }
    logger_1.logger.error({
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode,
        code,
        details: err.details
    }, err.message ?? "Unhandled error");
    res.status(statusCode).json({
        error: true,
        code,
        message: err.message ?? "Unexpected server error"
    });
};
exports.errorHandler = errorHandler;
