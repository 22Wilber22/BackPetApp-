"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const firebase_1 = require("../config/firebase");
const api_error_1 = require("../utils/api-error");
const requireAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new api_error_1.ApiError(401, "UNAUTHORIZED", "Missing bearer token");
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const decoded = await firebase_1.adminAuth.verifyIdToken(token, true);
        const roleFromClaims = decoded.role;
        req.user = {
            ...decoded,
            role: roleFromClaims ?? "usuario",
            clinicId: decoded.clinicId ?? null,
            supervisorVetId: decoded.supervisorVetId ?? null
        };
        next();
    }
    catch {
        next(new api_error_1.ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
    }
};
exports.requireAuth = requireAuth;
