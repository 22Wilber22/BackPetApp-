"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const api_error_1 = require("../utils/api-error");
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        const role = req.user?.role;
        if (!role || !allowedRoles.includes(role)) {
            next(new api_error_1.ApiError(403, "FORBIDDEN", "Insufficient permissions"));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
