"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, _res, next) => {
    const parsed = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });
    if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
        }));
        next({ statusCode: 400, code: "VALIDATION_ERROR", message: "Invalid request payload", details });
        return;
    }
    const data = parsed.data;
    // Avoid mutating req fields directly because some Express properties can be getter-only
    // depending on runtime/parser settings.
    req.validated = data;
    next();
};
exports.validate = validate;
