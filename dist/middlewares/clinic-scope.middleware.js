"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClinicContext = void 0;
const api_error_1 = require("../utils/api-error");
const tenantRoles = new Set(["jefe", "veterinario", "recepcionista", "asistente"]);
const requireClinicContext = (req, _res, next) => {
    const role = req.user?.role;
    if (!role) {
        next(new api_error_1.ApiError(401, "UNAUTHORIZED", "Authentication required"));
        return;
    }
    if (tenantRoles.has(role) && !req.user?.clinicId) {
        next(new api_error_1.ApiError(403, "FORBIDDEN", "Missing clinic context for tenant role"));
        return;
    }
    next();
};
exports.requireClinicContext = requireClinicContext;
